"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { nextInvoiceNumber } from "@/lib/billing";
import { gatewayFor, gatewayByProvider } from "@/lib/payments";
import { planPrice, planTierLabels, creditPrice } from "@/lib/plans";
import { fulfilInvoice, MAX_CREDITS_PER_PURCHASE } from "@/lib/fulfilment";
import { formatMoney } from "@/lib/constants";
import type { PlanTier, Invoice, AccountType, Currency } from "@/generated/prisma/client";

/**
 * Checkout for plan subscriptions and add-on interview credits (US-1.1, US-3.1).
 *
 * Both flows share a shape: raise an invoice, hand it to the account's gateway,
 * and fulfil (activate the plan / increment the balance) only once the charge
 * settles. When the gateway has no live credentials the charge settles
 * immediately in simulation mode so the flow stays testable end to end.
 */

export type CheckoutResponse = { url?: string; done?: boolean; error?: string };

const PLAN_TIERS: PlanTier[] = ["STANDARD", "PREMIUM"];

/** Subscribes to (or renews/changes to) a plan tier. */
export async function subscribeToPlan(tier: string): Promise<CheckoutResponse> {
  const user = await requireRole("EMPLOYER");
  if (!PLAN_TIERS.includes(tier as PlanTier)) return { error: "Unknown plan." };
  const planTier = tier as PlanTier;

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
  if (!employer) return { error: "Complete your company profile first." };
  if (employer.suspendedAt) return { error: "Your account is suspended." };

  let amount: number;
  try {
    amount = planPrice(employer.accountType, planTier, employer.currency);
  } catch {
    return { error: `This plan is not available in ${employer.currency}.` };
  }

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId: employer.id,
      type: "PLAN_SUBSCRIPTION",
      amount,
      currency: employer.currency,
      status: "ISSUED",
      // Platform access is paid up front, unlike the 30-day net placement fee.
      dueAt: new Date(),
      lineItems: [
        {
          description: `${planTierLabels[planTier]} plan — 1 month platform access`,
          amount,
        },
      ],
      purchase: { kind: "PLAN_SUBSCRIPTION", tier: planTier },
    },
  });

  return startCheckout(invoice, employer, user.email!, {
    description: `Oakvale ${planTierLabels[planTier]} subscription`,
    metadata: { kind: "PLAN_SUBSCRIPTION", tier: planTier },
    callbackPath: `/employer/plans?reference=`,
  });
}

/** Buys standalone interview credits (₦5,000 / $7 / £5 each). */
export async function buyInterviewCredits(quantity: number): Promise<CheckoutResponse> {
  const user = await requireRole("EMPLOYER");
  const qty = Math.floor(Number(quantity));
  if (!Number.isFinite(qty) || qty < 1 || qty > MAX_CREDITS_PER_PURCHASE) {
    return { error: `Choose between 1 and ${MAX_CREDITS_PER_PURCHASE} credits.` };
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
  if (!employer) return { error: "Complete your company profile first." };
  if (employer.suspendedAt) return { error: "Your account is suspended." };

  const unit = creditPrice(employer.currency);
  const amount = unit * qty;

  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId: employer.id,
      type: "INTERVIEW_CREDIT",
      amount,
      currency: employer.currency,
      status: "ISSUED",
      dueAt: new Date(),
      lineItems: [
        {
          description: `${qty} × standalone interview credit (${formatMoney(unit, employer.currency)} each)`,
          amount,
        },
      ],
      purchase: { kind: "INTERVIEW_CREDIT", quantity: qty },
    },
  });

  return startCheckout(invoice, employer, user.email!, {
    description: `Oakvale interview credits ×${qty}`,
    metadata: { kind: "INTERVIEW_CREDIT", quantity: qty },
    callbackPath: `/employer/billing?reference=`,
  });
}

/** Shared gateway hand-off: redirect for live gateways, fulfil for simulated. */
async function startCheckout(
  invoice: Invoice,
  employer: { id: string; accountType: AccountType; currency: Currency },
  email: string,
  opts: { description: string; metadata: Record<string, unknown>; callbackPath: string },
): Promise<CheckoutResponse> {
  const gateway = gatewayFor(employer.accountType, employer.currency);
  const reference = `${invoice.number}-${Date.now()}`;

  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { provider: gateway.provider, providerRef: reference },
  });

  try {
    const result = await gateway.checkout({
      email,
      amount: invoice.amount,
      currency: invoice.currency,
      reference,
      callbackPath: `${opts.callbackPath}${reference}`,
      description: opts.description,
      metadata: { invoiceId: invoice.id, ...opts.metadata },
    });

    if (result.kind === "redirect") return { url: result.url };

    // Simulation mode — settle immediately.
    await fulfilInvoice(invoice.id, reference);
    revalidatePath("/employer/plans");
    revalidatePath("/employer/billing");
    return { done: true };
  } catch (e) {
    await prisma.invoice.update({ where: { id: invoice.id }, data: { status: "VOID" } });
    return { error: e instanceof Error ? e.message : "Could not start payment." };
  }
}

/** Verifies a gateway callback reference and fulfils on success. */
export async function verifyPlanPayment(reference: string): Promise<boolean> {
  const user = await requireRole("EMPLOYER");
  const invoice = await prisma.invoice.findFirst({
    where: { providerRef: reference, employer: { userId: user.id } },
  });
  if (!invoice) return false;
  if (invoice.status === "PAID") return true;

  const gateway = gatewayByProvider(invoice.provider ?? "PAYSTACK");
  const ok = await gateway.verify(reference);
  if (!ok) return false;

  await fulfilInvoice(invoice.id, reference);
  revalidatePath("/employer/plans");
  revalidatePath("/employer/billing");
  return true;
}
