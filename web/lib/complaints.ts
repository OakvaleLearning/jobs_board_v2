import { prisma } from "@/lib/prisma";
import { COMPLAINT_SLA_HOURS, complaintUrgencyFor } from "@/lib/constants";
import type { ComplaintCategory, ComplaintUrgency } from "@/generated/prisma/client";

/** Next sequential case reference, e.g. OAK-C-0007. */
export async function nextCaseRef(): Promise<string> {
  const count = await prisma.complaint.count();
  return `OAK-C-${String(count + 1).padStart(4, "0")}`;
}

/** SLA deadline from now, based on the complaint's urgency. */
export function slaDeadline(urgency: ComplaintUrgency, from = new Date()): Date {
  const due = new Date(from);
  due.setHours(due.getHours() + COMPLAINT_SLA_HOURS[urgency]);
  return due;
}

/** Serious/safeguarding misconduct auto-suspends the worker (brief §9.4). */
export function isSafeguarding(category: ComplaintCategory): boolean {
  return category === "WORKER_MISCONDUCT_SERIOUS";
}

export { complaintUrgencyFor };

/** SLA colour bucket for the agent dashboard. */
export function slaState(
  slaDueAt: Date | null | undefined,
  closed: boolean,
  now = new Date(),
): "closed" | "on_track" | "approaching" | "overdue" {
  if (closed) return "closed";
  if (!slaDueAt) return "on_track";
  const hoursLeft = (new Date(slaDueAt).getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursLeft < 0) return "overdue";
  if (hoursLeft < 8) return "approaching";
  return "on_track";
}

export const slaStateMeta: Record<
  ReturnType<typeof slaState>,
  { label: string; color: "default" | "success" | "warning" | "error" }
> = {
  closed: { label: "Closed", color: "default" },
  on_track: { label: "On track", color: "success" },
  approaching: { label: "Approaching SLA", color: "warning" },
  overdue: { label: "Overdue", color: "error" },
};
