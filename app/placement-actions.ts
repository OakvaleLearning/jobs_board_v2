"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyAdmins, notify } from "@/lib/notifications";
import { guaranteeDaysLeft } from "@/lib/placement";
import { recomputeMatchingWeights } from "@/lib/matching";

/** Raise a replacement request. Employer (owner) or agent/admin may trigger it (brief §8.4). */
export async function requestReplacement(placementId: string, reason: string) {
  const user = await requireUser();
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: true, worker: { include: { user: true } } },
  });
  if (!placement) return;

  const isOwner = user.role === "EMPLOYER" && placement.employer.userId === user.id;
  const isStaff = user.role === "AGENT" || user.role === "ADMIN";
  if (!isOwner && !isStaff) return;

  const daysLeft = guaranteeDaysLeft(placement.guaranteeWindowEnds);
  const withinGuarantee = daysLeft !== null && daysLeft >= 0;

  await prisma.placement.update({
    where: { id: placementId },
    data: { status: "UNDER_REVIEW", replacementReason: reason || null },
  });

  await audit({
    userId: user.id,
    action: "placement.replacement_requested",
    entityType: "Placement",
    entityId: placementId,
    meta: { reason, withinGuarantee },
  });

  await notifyAdmins({
    type: "placement.replacement",
    title: `Replacement requested — ${placement.roleTitle}`,
    body: `${user.name} requested a replacement (${reason || "no reason given"}). ${
      withinGuarantee ? "Within 90-day guarantee — no additional placement fee." : "Outside guarantee window."
    } Source a new shortlist from Matching.`,
    link: `/agent/placements/${placementId}`,
  });

  await recomputeMatchingWeights();

  revalidatePath(`/employer/placements/${placementId}`);
  revalidatePath(`/agent/placements/${placementId}`);
}

/** Closes a placement (agent/admin), recording an end date. */
export async function endPlacement(placementId: string, reason: string) {
  const user = await requireUser();
  if (user.role !== "AGENT" && user.role !== "ADMIN") return;
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: true, worker: { include: { user: true } } },
  });
  if (!placement) return;

  await prisma.placement.update({
    where: { id: placementId },
    data: { status: "ENDED", actualEndDate: new Date(), performanceNotes: reason || placement.performanceNotes },
  });
  await audit({ userId: user.id, action: "placement.ended", entityType: "Placement", entityId: placementId });

  // Notify both parties the placement ended and invite a review.
  await notify({
    userId: placement.worker.user.id,
    type: "placement.ended",
    title: "Placement ended — leave a review",
    body: `Your placement as ${placement.roleTitle} has been closed. You can now review the employer.`,
    link: `/worker/placements/${placementId}`,
  });
  await notify({
    userId: placement.employer.userId,
    type: "placement.ended",
    title: "Placement ended — leave a review",
    body: `The placement "${placement.roleTitle}" has been closed. You can now review the worker.`,
    link: `/employer/placements/${placementId}`,
  });

  await recomputeMatchingWeights();
  revalidatePath(`/agent/placements/${placementId}`);
}
