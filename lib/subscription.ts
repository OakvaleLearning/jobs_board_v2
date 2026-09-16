import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { featuresFor, planFor, type PlanFeatures } from "@/lib/plans";
import type {
  AccountType,
  EmployerProfile,
  PlanTier,
} from "@/generated/prisma/client";

/**
 * Subscription state and the interview credit engine (PRD Modules 1–3).
 *
 * Credits are held as a running balance on the employer profile. The monthly
 * allowance is granted lazily — the first read after a period boundary tops the
 * balance back up — so no cron job is required for correctness.
 */

/** The employer fields this module needs. Accepts a full profile or a subset. */
export type PlanBearer = Pick<
  EmployerProfile,
  | "id"
  | "accountType"
  | "currency"
  | "planTier"
  | "subscriptionStatus"
  | "periodEnd"
  | "allowanceCredits"
  | "purchasedCredits"
  | "creditsGrantedAt"
>;

/**
 * Spendable interview credits: this period's remaining allowance plus any
 * credits bought outright. Always read the balance through this rather than
 * either bucket alone.
 */
export function creditBalance(employer: PlanBearer | null | undefined): number {
  if (!employer) return 0;
  return employer.allowanceCredits + employer.purchasedCredits;
}

/** True while the employer holds a paid, in-date plan. */
export function subscriptionActive(employer: PlanBearer | null | undefined): boolean {
  if (!employer) return false;
  if (employer.subscriptionStatus !== "ACTIVE") return false;
  if (!employer.planTier) return false;
  return !employer.periodEnd || employer.periodEnd.getTime() > Date.now();
}

/** The features an employer currently has. An expired plan grants nothing. */
export function currentFeatures(employer: PlanBearer | null | undefined): PlanFeatures {
  if (!employer || !subscriptionActive(employer)) {
    return featuresFor(employer?.accountType ?? "LOCAL_NG", null);
  }
  return featuresFor(employer.accountType, employer.planTier);
}

/**
 * US-2.1 — the Enhanced Vetting Pack is a Diaspora Sponsor feature. A local
 * subscriber gets an upgrade explanation instead, never a silent 404.
 */
export function canViewVettingPack(employer: PlanBearer | null | undefined): boolean {
  return currentFeatures(employer).enhancedVettingPack;
}

/** US-4.1 — the Remote Care Oversight Suite is Diaspora-exclusive. */
export function canUseCareOversight(employer: PlanBearer | null | undefined): boolean {
  return currentFeatures(employer).remoteCareOversight;
}

/** A plain-language reason a subscription-gated action is unavailable, or null. */
export function subscriptionBlockReason(employer: PlanBearer | null | undefined): string | null {
  if (!employer) return "Complete your company profile to choose a plan.";
  if (!employer.planTier || employer.subscriptionStatus === "INACTIVE") {
    return "Choose a subscription plan to access the candidate directory and interviews.";
  }
  if (employer.subscriptionStatus === "CANCELLED") {
    return "Your subscription has been cancelled. Resubscribe to continue hiring.";
  }
  if (!subscriptionActive(employer)) {
    return "Your subscription has lapsed. Renew to restore access.";
  }
  return null;
}

// ---------------------------------------------------------------------------
// Period & allowance handling
// ---------------------------------------------------------------------------

/** One month from `from`, clamping end-of-month overflow (31 Jan → 28 Feb). */
export function addMonth(from: Date): Date {
  const next = new Date(from);
  const day = next.getDate();
  next.setMonth(next.getMonth() + 1);
  if (next.getDate() < day) next.setDate(0); // rolled into the next month — step back
  return next;
}

/**
 * Activates (or renews) a plan: sets the tier, opens a fresh monthly period and
 * grants that tier's interview allowance.
 *
 * Renewing mid-period extends from the existing period end so an employer never
 * loses paid days by upgrading early.
 */
export async function activatePlan(employerId: string, tier: PlanTier) {
  const employer = await prisma.employerProfile.findUnique({ where: { id: employerId } });
  if (!employer) return null;

  const plan = planFor(employer.accountType, tier);
  const now = new Date();
  const base =
    employer.periodEnd && employer.periodEnd > now && employer.planTier === tier
      ? employer.periodEnd
      : now;

  const updated = await prisma.employerProfile.update({
    where: { id: employerId },
    data: {
      planTier: tier,
      subscriptionStatus: "ACTIVE",
      subscribedAt: employer.subscribedAt ?? now,
      periodEnd: addMonth(base),
      // A new period replaces the allowance; purchased credits are left alone.
      allowanceCredits: plan.features.interviewsPerMonth,
      creditsGrantedAt: now,
    },
  });

  await audit({
    action: "subscription.activated",
    entityType: "EmployerProfile",
    entityId: employerId,
    meta: { tier, accountType: employer.accountType, periodEnd: updated.periodEnd },
  });
  return updated;
}

/**
 * Re-grants the monthly allowance if the employer has crossed a period
 * boundary. Call before any read or spend of the credit balance.
 *
 * Returns the employer with an up-to-date balance.
 */
export async function refreshCreditsIfDue<T extends PlanBearer>(employer: T): Promise<T> {
  if (!employer.planTier || employer.subscriptionStatus !== "ACTIVE") return employer;
  if (!employer.periodEnd || employer.periodEnd.getTime() > Date.now()) return employer;

  // The period lapsed. Roll forward to the current period and re-grant.
  const plan = planFor(employer.accountType, employer.planTier);
  let periodEnd = employer.periodEnd;
  while (periodEnd.getTime() <= Date.now()) periodEnd = addMonth(periodEnd);

  const updated = await prisma.employerProfile.update({
    where: { id: employer.id },
    data: {
      periodEnd,
      allowanceCredits: plan.features.interviewsPerMonth,
      creditsGrantedAt: new Date(),
    },
  });

  await audit({
    action: "subscription.credits.refreshed",
    entityType: "EmployerProfile",
    entityId: employer.id,
    meta: { tier: employer.planTier, granted: plan.features.interviewsPerMonth },
  });
  return { ...employer, ...updated };
}

// ---------------------------------------------------------------------------
// Credit spending & granting
// ---------------------------------------------------------------------------

export type CreditSpend =
  | { ok: true; remaining: number }
  | { ok: false; reason: "no_subscription" | "no_credits" };

/**
 * Spends one interview credit, drawing on this period's allowance before any
 * purchased credits — so credits the employer paid for outlive the period they
 * happened to be bought in.
 *
 * Each step is a conditional update (`{ gt: 0 }`), which is the concurrency
 * guard: two simultaneous schedule attempts on a balance of 1 cannot both win.
 */
export async function spendInterviewCredit(employerId: string): Promise<CreditSpend> {
  const employer = await prisma.employerProfile.findUnique({ where: { id: employerId } });
  if (!employer) return { ok: false, reason: "no_subscription" };

  const fresh = await refreshCreditsIfDue(employer);
  if (!subscriptionActive(fresh)) return { ok: false, reason: "no_subscription" };

  const fromAllowance = await prisma.employerProfile.updateMany({
    where: { id: employerId, allowanceCredits: { gt: 0 } },
    data: { allowanceCredits: { decrement: 1 } },
  });

  let bucket: "allowance" | "purchased" = "allowance";
  if (fromAllowance.count === 0) {
    const fromPurchased = await prisma.employerProfile.updateMany({
      where: { id: employerId, purchasedCredits: { gt: 0 } },
      data: { purchasedCredits: { decrement: 1 } },
    });
    if (fromPurchased.count === 0) return { ok: false, reason: "no_credits" };
    bucket = "purchased";
  }

  await audit({
    action: "interview.credit.spent",
    entityType: "EmployerProfile",
    entityId: employerId,
    meta: { bucket },
  });
  return { ok: true, remaining: Math.max(0, creditBalance(fresh) - 1) };
}

/**
 * Returns a spent credit — used when a virtual interview is cancelled unused.
 * Credited to the purchased bucket, which never expires, so a refund can't be
 * silently swallowed by a period reset.
 */
export async function refundInterviewCredit(employerId: string) {
  await prisma.employerProfile.update({
    where: { id: employerId },
    data: { purchasedCredits: { increment: 1 } },
  });
  await audit({
    action: "interview.credit.refunded",
    entityType: "EmployerProfile",
    entityId: employerId,
  });
}

/** Adds purchased add-on credits. Applied the moment a credit payment settles. */
export async function grantInterviewCredits(employerId: string, quantity: number) {
  const updated = await prisma.employerProfile.update({
    where: { id: employerId },
    data: { purchasedCredits: { increment: quantity } },
  });
  await audit({
    action: "interview.credit.granted",
    entityType: "EmployerProfile",
    entityId: employerId,
    meta: { quantity, balance: creditBalance(updated) },
  });
  return updated;
}

// ---------------------------------------------------------------------------
// Directory reach
// ---------------------------------------------------------------------------

/**
 * "Diaspora-ready" candidates are those whose file supports remote assessment:
 * a video introduction on record. Local accounts see the full verified local
 * pool; diaspora accounts see that pool plus this flag surfaced on each card.
 */
export function isDiasporaReady(documents: { type: string }[]): boolean {
  return documents.some((d) => d.type === "VIDEO_INTRO");
}

/** Convenience wrapper: loads the employer and tops up credits in one call. */
export async function getBillingProfile(userId: string) {
  const employer = await prisma.employerProfile.findUnique({ where: { userId } });
  if (!employer) return null;
  return refreshCreditsIfDue(employer);
}

export function accountTypeOf(employer: PlanBearer | null | undefined): AccountType {
  return employer?.accountType ?? "LOCAL_NG";
}
