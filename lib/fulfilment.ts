import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { planFor, planTierLabels } from "@/lib/plans";
import { activatePlan, grantInterviewCredits } from "@/lib/subscription";
import type { PlanTier } from "@/generated/prisma/client";

/**
 * Applies what a settled platform invoice bought.
 *
 * Kept out of the server-action module deliberately: it must be reachable from
 * the gateway webhook and the post-redirect verify, but never callable from a
 * browser, which exporting it from a `"use server"` file would allow.
 */

export const MAX_CREDITS_PER_PURCHASE = 20;

const PLAN_TIERS: PlanTier[] = ["STANDARD", "PREMIUM"];

export type Purchase =
  | { kind: "PLAN_SUBSCRIPTION"; tier: PlanTier }
  | { kind: "INTERVIEW_CREDIT"; quantity: number }
  | { kind: "UNKNOWN" };

/** Reads the structured purchase written when the invoice was raised. */
export function readPurchase(value: unknown): Purchase {
  if (!value || typeof value !== "object") return { kind: "UNKNOWN" };
  const record = value as Record<string, unknown>;

  if (record.kind === "PLAN_SUBSCRIPTION" && PLAN_TIERS.includes(record.tier as PlanTier)) {
    return { kind: "PLAN_SUBSCRIPTION", tier: record.tier as PlanTier };
  }
  if (record.kind === "INTERVIEW_CREDIT") {
    const qty = Math.floor(Number(record.quantity));
    if (Number.isFinite(qty) && qty > 0) {
      return { kind: "INTERVIEW_CREDIT", quantity: Math.min(qty, MAX_CREDITS_PER_PURCHASE) };
    }
  }
  return { kind: "UNKNOWN" };
}

/**
 * Marks a platform invoice paid and grants what it bought. Idempotent — a
 * gateway callback and its webhook may both arrive for the same reference.
 */
export async function fulfilInvoice(invoiceId: string, reference: string) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { employer: true },
  });
  if (!invoice || invoice.status === "PAID") return;

  // Conditional update is the idempotency guard: only the first caller to move
  // the invoice out of an unpaid state goes on to grant the entitlement.
  const { count } = await prisma.invoice.updateMany({
    where: { id: invoiceId, status: { not: "PAID" } },
    data: { status: "PAID", paidAt: new Date(), providerRef: reference },
  });
  if (count === 0) return;

  const purchase = readPurchase(invoice.purchase);

  if (invoice.type === "PLAN_SUBSCRIPTION" && purchase.kind === "PLAN_SUBSCRIPTION") {
    await activatePlan(invoice.employerId, purchase.tier);
    const plan = planFor(invoice.employer.accountType, purchase.tier);
    const allowance = plan.features.interviewsPerMonth;
    await notify({
      userId: invoice.employer.userId,
      type: "subscription.active",
      title: `${planTierLabels[purchase.tier]} plan active`,
      body: `Your plan is live with ${allowance} virtual interview${
        allowance === 1 ? "" : "s"
      } included this month.`,
      link: "/employer/plans",
      email: true,
    });
  } else if (invoice.type === "INTERVIEW_CREDIT" && purchase.kind === "INTERVIEW_CREDIT") {
    await grantInterviewCredits(invoice.employerId, purchase.quantity);
    await notify({
      userId: invoice.employer.userId,
      type: "credits.added",
      title: "Interview credits added",
      body: `${purchase.quantity} interview credit${
        purchase.quantity === 1 ? "" : "s"
      } are now available on your account.`,
      link: "/employer/billing",
    });
  }

  await audit({
    action: "invoice.fulfilled",
    entityType: "Invoice",
    entityId: invoiceId,
    meta: { reference, type: invoice.type },
  });
}
