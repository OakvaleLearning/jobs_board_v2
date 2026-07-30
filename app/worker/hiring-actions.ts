"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { applicationBlockReason } from "@/lib/worker";
import { generatePlacementContracts } from "@/lib/contracts";
import { issuePlacementInvoice } from "@/lib/billing";
import { guaranteeWindowEnds, cpdCycleMonths } from "@/lib/placement";
import type { FormState } from "@/lib/forms";

export async function applyToJob(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("WORKER");
  const jobId = String(formData.get("jobId") || "");
  const coverNote = String(formData.get("coverNote") || "").trim();

  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!worker) return { ok: false, message: "Complete your profile before applying." };

  // Server-side enforcement of the dual gate (profile + certificate approved).
  const block = applicationBlockReason(worker);
  if (block) return { ok: false, message: block };

  const job = await prisma.job.findFirst({
    where: { id: jobId, status: "APPROVED", visibility: "PUBLIC", deletedAt: null },
  });
  if (!job) return { ok: false, message: "This job is no longer accepting applications." };

  const existing = await prisma.application.findUnique({
    where: { jobId_workerId: { jobId, workerId: worker.id } },
  });
  if (existing) return { ok: false, message: "You've already applied to this job." };

  const application = await prisma.application.create({
    data: { jobId, workerId: worker.id, coverNote: coverNote || null, status: "APPLIED" },
    include: { job: { include: { employer: true } } },
  });

  await audit({ userId: user.id, action: "application.created", entityType: "Application", entityId: application.id });
  await notify({
    userId: application.job.employer.userId,
    type: "application.received",
    title: "New applicant",
    body: `${user.name} applied to "${application.job.title}".`,
    link: `/employer/jobs/${jobId}`,
    email: true,
  });

  revalidatePath("/worker/applications");
  revalidatePath(`/worker/jobs/${jobId}`);
  return { ok: true, message: "Application submitted. The employer has been notified." };
}

export async function respondToInterview(interviewId: string, confirmedTime: string | null, decline = false) {
  const user = await requireRole("WORKER");
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId },
    include: { application: { include: { worker: true, job: { include: { employer: true } } } } },
  });
  if (!interview || interview.application.worker.userId !== user.id) return;

  await prisma.interview.update({
    where: { id: interviewId },
    data: decline
      ? { status: "CANCELLED" }
      : { status: "CONFIRMED", confirmedTime: confirmedTime ? new Date(confirmedTime) : null },
  });
  await audit({
    userId: user.id,
    action: decline ? "interview.declined" : "interview.confirmed",
    entityType: "Interview",
    entityId: interviewId,
  });
  await notify({
    userId: interview.application.job.employer.userId,
    type: "interview.response",
    title: decline ? "Interview declined" : "Interview confirmed",
    body: `${user.name} ${decline ? "declined" : "confirmed"} the interview for "${interview.application.job.title}".`,
    link: `/employer/jobs/${interview.application.jobId}`,
    email: true,
  });
  revalidatePath("/worker/applications");
}

export async function respondToOffer(offerId: string, decision: "ACCEPTED" | "DECLINED") {
  const user = await requireRole("WORKER");
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      application: {
        include: {
          worker: { include: { user: true, workforceCategory: true } },
          job: { include: { employer: true } },
        },
      },
    },
  });
  if (!offer || offer.application.worker.userId !== user.id) return;
  if (offer.status !== "SENT") return; // only respond to released offers

  let placementId: string | null = null;

  await prisma.$transaction(async (tx) => {
    await tx.offer.update({ where: { id: offerId }, data: { status: decision } });
    await tx.application.update({
      where: { id: offer.applicationId },
      data: { status: decision === "ACCEPTED" ? "HIRED" : "DECLINED" },
    });

    if (decision === "ACCEPTED") {
      const placement = await tx.placement.create({
        data: {
          workerId: offer.application.workerId,
          employerId: offer.application.job.employerId,
          jobId: offer.application.jobId,
          offerId: offer.id,
          roleTitle: offer.roleTitle,
          startDate: offer.startDate,
          status: "ACTIVE",
          salary: offer.salary,
          salaryCurrency: offer.salaryCurrency,
          guaranteeWindowEnds: guaranteeWindowEnds(offer.startDate),
          accountManagerId: offer.application.job.employer.assignedAgentId,
        },
      });
      placementId = placement.id;

      // Begin CPD tracking from placement start if not already on a cycle.
      const worker = offer.application.worker;
      if (!worker.cpdNextDueAt) {
        const start = worker.certCompletionDate ?? offer.startDate;
        const next = new Date(start);
        next.setMonth(next.getMonth() + cpdCycleMonths(worker.workforceCategory?.config));
        await tx.workerProfile.update({
          where: { id: worker.id },
          data: { cpdLastCompletedAt: worker.certCompletionDate ?? start, cpdNextDueAt: next },
        });
      }
    }
  });

  // Post-commit side effects (PDF generation, invoice) — kept out of the transaction.
  if (decision === "ACCEPTED" && placementId) {
    await generatePlacementContracts(placementId);
    await issuePlacementInvoice(placementId);
    await notify({
      userId: user.id,
      type: "contract.ready",
      title: "Sign your placement contract",
      body: `Your Worker Placement Agreement for "${offer.application.job.title}" is ready to sign.`,
      link: `/worker/placements/${placementId}`,
      email: true,
    });
  }

  await audit({
    userId: user.id,
    action: decision === "ACCEPTED" ? "offer.accepted" : "offer.declined",
    entityType: "Offer",
    entityId: offerId,
  });

  // On acceptance the employer receives the worker's now-unmasked contact details.
  await notify({
    userId: offer.application.job.employer.userId,
    type: "offer.response",
    title: decision === "ACCEPTED" ? "Offer accepted — placement active" : "Offer declined",
    body:
      decision === "ACCEPTED"
        ? `${user.name} accepted your offer. Contact: ${offer.application.worker.user.email}, ${offer.application.worker.user.phone ?? "no phone"}. Sign your Employer Service Agreement to complete the placement.`
        : `${user.name} declined the offer for "${offer.application.job.title}".`,
    link: placementId ? `/employer/placements/${placementId}` : `/employer/jobs/${offer.application.jobId}`,
    email: true,
  });

  revalidatePath("/worker/applications");
  revalidatePath("/worker/placements");
  revalidatePath("/employer/placements");
  revalidatePath(`/employer/jobs/${offer.application.jobId}`);
}
