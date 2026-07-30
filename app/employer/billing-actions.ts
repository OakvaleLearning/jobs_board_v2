"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyAdmins } from "@/lib/notifications";
import { paystackConfigured, initializeTransaction, verifyTransaction } from "@/lib/paystack";

type PayResult = { url?: string; paid?: boolean; error?: string };

/** Starts payment for an invoice. Falls back to a dev "mark paid" when Paystack isn't configured. */
export async function payInvoice(invoiceId: string): Promise<PayResult> {
  const user = await requireRole("EMPLOYER");
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { employer: true },
  });
  if (!invoice || invoice.employer.userId !== user.id) return { error: "Invoice not found." };
  if (invoice.status === "PAID") return { paid: true };

  // Dev fallback — no Paystack key configured.
  if (!paystackConfigured()) {
    await markPaid(invoice.id, `SIM-${invoice.number}`);
    revalidatePath("/employer/billing");
    return { paid: true };
  }

  const reference = `${invoice.number}-${Date.now()}`;
  try {
    const { authorizationUrl } = await initializeTransaction({
      email: user.email!,
      amountNaira: invoice.amount,
      reference,
      callbackPath: `/employer/billing?reference=${reference}`,
      metadata: { invoiceId: invoice.id },
    });
    await prisma.invoice.update({ where: { id: invoice.id }, data: { paystackRef: reference } });
    return { url: authorizationUrl };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not start payment." };
  }
}

/** Verifies a Paystack callback reference and marks the invoice paid on success. */
export async function verifyInvoicePayment(reference: string): Promise<boolean> {
  await requireRole("EMPLOYER");
  if (!paystackConfigured()) return false;
  const invoice = await prisma.invoice.findFirst({ where: { paystackRef: reference } });
  if (!invoice || invoice.status === "PAID") return invoice?.status === "PAID";
  const ok = await verifyTransaction(reference);
  if (ok) {
    await markPaid(invoice.id, reference);
    revalidatePath("/employer/billing");
  }
  return ok;
}

async function markPaid(invoiceId: string, reference: string) {
  const invoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: "PAID", paidAt: new Date(), paystackRef: reference },
    include: { employer: { include: { user: true } } },
  });
  await audit({ action: "invoice.paid", entityType: "Invoice", entityId: invoiceId, meta: { reference } });
  await notifyAdmins({
    type: "invoice.paid",
    title: `Invoice ${invoice.number} paid`,
    body: `${invoice.employer.orgName ?? invoice.employer.user.name} paid ₦${invoice.amount.toLocaleString()}.`,
    link: "/agent/accounts",
  });
}
