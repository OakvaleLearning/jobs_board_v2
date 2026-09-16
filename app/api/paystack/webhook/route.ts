import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyWebhookSignature } from "@/lib/paystack";
import { audit } from "@/lib/audit";
import { fulfilInvoice } from "@/lib/fulfilment";

/** Paystack webhook — marks an invoice paid on a successful charge. */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: { event?: string; data?: { reference?: string } };
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }

  if (event.event === "charge.success" && event.data?.reference) {
    const reference = event.data.reference;
    // Platform checkouts (plans, credits) store `providerRef`; legacy
    // placement-fee invoices store `paystackRef`. Match either.
    const invoice = await prisma.invoice.findFirst({
      where: { OR: [{ providerRef: reference }, { paystackRef: reference }] },
    });
    if (invoice && invoice.status !== "PAID") {
      if (invoice.type === "PLAN_SUBSCRIPTION" || invoice.type === "INTERVIEW_CREDIT") {
        // Marks paid *and* grants the plan or credits it bought.
        await fulfilInvoice(invoice.id, reference);
      } else {
        await prisma.invoice.update({
          where: { id: invoice.id },
          data: { status: "PAID", paidAt: new Date() },
        });
      }
      await audit({ action: "invoice.paid.webhook", entityType: "Invoice", entityId: invoice.id });
    }
  }

  return NextResponse.json({ received: true });
}
