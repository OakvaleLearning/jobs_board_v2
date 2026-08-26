import { prisma } from "@/lib/prisma";
import { placementFeeFor } from "@/lib/contracts";
import {
  DEFAULT_SUBSCRIPTION_FEE_NGN,
  DEFAULT_CPD_REFRESH_FEE_NGN,
} from "@/lib/constants";

/** Reads a positive numeric fee from an employer type's config JSON, else a default. */
function feeFromConfig(config: unknown, key: string, fallback: number): number {
  if (config && typeof config === "object" && key in config) {
    const v = (config as Record<string, unknown>)[key];
    if (typeof v === "number" && v > 0) return v;
  }
  return fallback;
}

/** Next sequential invoice number, e.g. OAK-INV-0007. */
export async function nextInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  return `OAK-INV-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Issues the placement-fee invoice for a newly-activated placement (idempotent).
 * NGN only; 30-day net terms per the corporate procurement model.
 */
export async function issuePlacementInvoice(placementId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: { include: { employerType: true } } },
  });
  if (!placement) return null;

  const existing = await prisma.invoice.findFirst({
    where: { placementId, type: "PLACEMENT_FEE" },
  });
  if (existing) return existing;

  const amount = placementFeeFor(placement.employer.employerType?.config);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 30);

  return prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId: placement.employerId,
      placementId,
      type: "PLACEMENT_FEE",
      amount,
      currency: "NGN",
      status: "ISSUED",
      dueAt,
      lineItems: [{ description: `Placement fee — ${placement.roleTitle}`, amount }],
    },
  });
}

/**
 * Issues the annual partnership subscription invoice for a corporate employer
 * (brief §10.2). NGN, 30-day net. Guards against stacking a second unpaid
 * subscription invoice, but allows a fresh one once the prior year's is paid
 * (i.e. renewal).
 */
export async function issueSubscriptionInvoice(employerId: string) {
  const employer = await prisma.employerProfile.findUnique({
    where: { id: employerId },
    include: { employerType: true },
  });
  if (!employer) return null;

  const open = await prisma.invoice.findFirst({
    where: { employerId, type: "SUBSCRIPTION", status: { in: ["ISSUED", "OVERDUE"] } },
  });
  if (open) return open;

  const amount = feeFromConfig(employer.employerType?.config, "subscriptionFee", DEFAULT_SUBSCRIPTION_FEE_NGN);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 30);

  return prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId,
      type: "SUBSCRIPTION",
      amount,
      currency: "NGN",
      status: "ISSUED",
      dueAt,
      lineItems: [{ description: "Annual partnership subscription", amount }],
    },
  });
}

/**
 * Issues the annual CPD-refresh invoice for a placed worker (brief §10.2).
 * NGN, 30-day net. Idempotent within the CPD cycle: skips if a CPD-refresh
 * invoice already exists for this placement in the last ~11 months.
 */
export async function issueCpdRefreshInvoice(placementId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: { include: { employerType: true } } },
  });
  if (!placement) return null;

  const since = new Date();
  since.setMonth(since.getMonth() - 11);
  const recent = await prisma.invoice.findFirst({
    where: { placementId, type: "CPD_REFRESH", createdAt: { gte: since } },
  });
  if (recent) return recent;

  const amount = feeFromConfig(placement.employer.employerType?.config, "cpdRefreshFee", DEFAULT_CPD_REFRESH_FEE_NGN);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 30);

  return prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId: placement.employerId,
      placementId,
      type: "CPD_REFRESH",
      amount,
      currency: "NGN",
      status: "ISSUED",
      dueAt,
      lineItems: [{ description: `CPD refresh — ${placement.roleTitle}`, amount }],
    },
  });
}
