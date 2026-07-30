import { prisma } from "@/lib/prisma";
import { CPD_CYCLE_MONTHS_DEFAULT, GUARANTEE_DAYS } from "@/lib/constants";
import type { CpdStatus } from "@/generated/prisma/client";

/** Full include used by every placement detail view. */
export const placementInclude = {
  worker: { include: { user: true, workforceCategory: true } },
  employer: { include: { user: true } },
  job: true,
  offer: true,
  accountManager: { select: { id: true, name: true, email: true, phone: true } },
  contracts: { orderBy: { createdAt: "asc" } },
  welfareChecks: { orderBy: { date: "desc" }, include: { agent: { select: { name: true } } } },
  invoices: { orderBy: { createdAt: "desc" } },
  reviews: { include: { author: { select: { name: true, role: true } } } },
} as const;

/** Derives CPD compliance state from a worker's next-due date. */
export function cpdStatus(cpdNextDueAt: Date | null | undefined, now = new Date()): CpdStatus | null {
  if (!cpdNextDueAt) return null; // not yet on a CPD cycle
  const due = new Date(cpdNextDueAt);
  const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) return "OVERDUE";
  if (days <= 30) return "DUE_SOON";
  return "CURRENT";
}

/** CPD refresh cycle (months) for a workforce category, from its config JSON. */
export function cpdCycleMonths(config: unknown): number {
  if (config && typeof config === "object" && "cpdCycleMonths" in config) {
    const v = (config as Record<string, unknown>).cpdCycleMonths;
    if (typeof v === "number" && v > 0) return v;
  }
  return CPD_CYCLE_MONTHS_DEFAULT;
}

/** Guarantee-window end date from a placement start date. */
export function guaranteeWindowEnds(startDate: Date, days = GUARANTEE_DAYS): Date {
  const end = new Date(startDate);
  end.setDate(end.getDate() + days);
  return end;
}

/** Whole days remaining in a placement's guarantee window (negative if elapsed). */
export function guaranteeDaysLeft(windowEnds: Date | null | undefined, now = new Date()): number | null {
  if (!windowEnds) return null;
  return Math.ceil((new Date(windowEnds).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export async function getPlacementForUser(placementId: string, userId: string, role: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: placementInclude,
  });
  if (!placement) return null;
  if (role === "ADMIN" || role === "AGENT") return placement;
  if (role === "WORKER" && placement.worker.userId === userId) return placement;
  if (role === "EMPLOYER" && placement.employer.userId === userId) return placement;
  return null;
}

export async function listPlacementsForUser(userId: string, role: string) {
  const where =
    role === "WORKER"
      ? { worker: { userId } }
      : role === "EMPLOYER"
        ? { employer: { userId } }
        : {};
  return prisma.placement.findMany({
    where,
    include: placementInclude,
    orderBy: { createdAt: "desc" },
  });
}
