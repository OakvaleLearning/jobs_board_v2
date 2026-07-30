"use server";

import { revalidatePath } from "next/cache";
import { requireUser, requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify, notifyAdmins } from "@/lib/notifications";
import { recomputeWorkerCompletion } from "@/lib/worker";
import { recomputeMatchingWeights } from "@/lib/matching";
import { nextCaseRef, slaDeadline, isSafeguarding, complaintUrgencyFor } from "@/lib/complaints";
import { complaintCategoryLabels } from "@/lib/constants";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { z } from "zod";
import type { ComplaintCategory } from "@/generated/prisma/client";

const schema = z.object({
  category: z.enum([
    "WORKER_NON_ATTENDANCE",
    "WORKER_UNDERPERFORMANCE",
    "WORKER_MISCONDUCT_MINOR",
    "WORKER_MISCONDUCT_SERIOUS",
    "EMPLOYER_UNFAIR_TREATMENT",
    "EMPLOYER_NON_PAYMENT",
    "PLATFORM_DISPUTE",
    "DATA_PRIVACY",
  ]),
  description: z.string().trim().min(50, "Please describe the issue in at least 50 characters."),
  placementId: z.string().optional(),
  incidentDate: z.string().optional(),
  preferredResolution: z.string().trim().max(1000).optional(),
});

export async function raiseComplaint(_p: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    category: formData.get("category"),
    description: formData.get("description"),
    placementId: formData.get("placementId") || undefined,
    incidentDate: formData.get("incidentDate") || undefined,
    preferredResolution: formData.get("preferredResolution") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const category = parsed.data.category as ComplaintCategory;
  const urgency = complaintUrgencyFor(category);

  // Auto-link an active placement and derive the "against" party.
  let placementId: string | null = null;
  let againstUserId: string | null = null;
  if (parsed.data.placementId) {
    const placement = await prisma.placement.findUnique({
      where: { id: parsed.data.placementId },
      include: { worker: { select: { userId: true } }, employer: { select: { userId: true } } },
    });
    if (placement && (placement.worker.userId === user.id || placement.employer.userId === user.id || user.role === "AGENT" || user.role === "ADMIN")) {
      placementId = placement.id;
      againstUserId = placement.worker.userId === user.id ? placement.employer.userId : placement.worker.userId;
    }
  }

  const complaint = await prisma.complaint.create({
    data: {
      caseRef: await nextCaseRef(),
      category,
      urgency,
      status: "SUBMITTED",
      stage: "TRIAGE",
      raisedById: user.id,
      againstUserId,
      placementId,
      incidentDate: parsed.data.incidentDate ? new Date(parsed.data.incidentDate) : null,
      description: parsed.data.description,
      preferredResolution: parsed.data.preferredResolution || null,
      slaDueAt: slaDeadline(urgency),
      events: { create: { actorId: user.id, stage: "TRIAGE", note: "Complaint submitted." } },
    },
  });

  // Safeguarding: suspend the worker immediately pending investigation (brief §9.4).
  if (isSafeguarding(category) && placementId) {
    const placement = await prisma.placement.findUnique({
      where: { id: placementId },
      include: { worker: true },
    });
    if (placement) {
      await prisma.workerProfile.update({
        where: { id: placement.workerId },
        data: { profileStatus: "SUSPENDED", searchable: false },
      });
      await recomputeWorkerCompletion(placement.workerId);
      await notify({
        userId: placement.worker.userId,
        type: "profile.suspended",
        title: "Account suspended pending investigation",
        body: "A safeguarding complaint has been raised. Your profile is suspended while Oakvale investigates.",
      });
    }
  }

  await audit({ userId: user.id, action: "complaint.raised", entityType: "Complaint", entityId: complaint.id, meta: { category, urgency } });
  await notifyAdmins({
    type: "complaint.new",
    title: `New complaint ${complaint.caseRef} (${urgency})`,
    body: `${complaintCategoryLabels[category]} — raised by ${user.name}. Triage within SLA.`,
    link: `/agent/complaints/${complaint.id}`,
  });

  const home = user.role === "WORKER" ? "/worker/complaints" : "/employer/complaints";
  revalidatePath(home);
  return { ok: true, message: `Complaint submitted. Your case reference is ${complaint.caseRef}.` };
}

/** Agent takes ownership of a case and moves it into acknowledgement. */
export async function takeCase(complaintId: string) {
  const agent = await requireAgent();
  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      assignedAgentId: agent.id,
      status: "TRIAGED",
      stage: "ACKNOWLEDGEMENT",
      events: { create: { actorId: agent.id, stage: "ACKNOWLEDGEMENT", note: `Assigned to ${agent.name}.` } },
    },
  });
  await audit({ userId: agent.id, action: "complaint.assigned", entityType: "Complaint", entityId: complaintId });
  revalidatePath(`/agent/complaints/${complaintId}`);
  revalidatePath("/agent/complaints");
}

/** Logs an investigation note and moves the case to INVESTIGATING. */
export async function logInvestigation(_p: FormState, formData: FormData): Promise<FormState> {
  const agent = await requireAgent();
  const complaintId = String(formData.get("complaintId") || "");
  const note = String(formData.get("note") || "").trim();
  if (note.length < 3) return { ok: false, message: "Add a note." };
  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: "INVESTIGATING",
      stage: "INVESTIGATION",
      events: { create: { actorId: agent.id, stage: "INVESTIGATION", note } },
    },
  });
  await audit({ userId: agent.id, action: "complaint.investigation", entityType: "Complaint", entityId: complaintId });
  revalidatePath(`/agent/complaints/${complaintId}`);
  return { ok: true, message: "Investigation note added." };
}

/** Records a resolution and notifies both parties. */
export async function resolveCase(_p: FormState, formData: FormData): Promise<FormState> {
  const agent = await requireAgent();
  const complaintId = String(formData.get("complaintId") || "");
  const resolutionNotes = String(formData.get("resolutionNotes") || "").trim();
  if (resolutionNotes.length < 10) return { ok: false, message: "Describe the resolution." };

  const complaint = await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: "RESOLVED",
      stage: "COMMUNICATION",
      resolutionNotes,
      events: { create: { actorId: agent.id, stage: "COMMUNICATION", note: resolutionNotes } },
    },
    include: { raisedBy: true, againstUser: true },
  });
  await audit({ userId: agent.id, action: "complaint.resolved", entityType: "Complaint", entityId: complaintId });

  for (const u of [complaint.raisedBy, complaint.againstUser]) {
    if (u) {
      await notify({
        userId: u.id,
        type: "complaint.resolved",
        title: `Complaint ${complaint.caseRef} resolved`,
        body: resolutionNotes,
        email: true,
      });
    }
  }
  await recomputeMatchingWeights();
  revalidatePath(`/agent/complaints/${complaintId}`);
  return { ok: true, message: "Resolution recorded and both parties notified." };
}

/** Closes a case, opening a 7-day reopen window. */
export async function closeCase(complaintId: string) {
  const agent = await requireAgent();
  const reopenDeadline = new Date();
  reopenDeadline.setDate(reopenDeadline.getDate() + 7);
  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: "CLOSED",
      stage: "CLOSURE",
      closedAt: new Date(),
      reopenDeadline,
      events: { create: { actorId: agent.id, stage: "CLOSURE", note: "Case closed." } },
    },
  });
  await audit({ userId: agent.id, action: "complaint.closed", entityType: "Complaint", entityId: complaintId });
  revalidatePath(`/agent/complaints/${complaintId}`);
  revalidatePath("/agent/complaints");
}

/** Complainant reopens a closed case within 7 days. */
export async function reopenCase(complaintId: string) {
  const user = await requireUser();
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!complaint || complaint.raisedById !== user.id) return;
  if (!complaint.reopenDeadline || complaint.reopenDeadline < new Date()) return;
  await prisma.complaint.update({
    where: { id: complaintId },
    data: {
      status: "REOPENED",
      events: { create: { actorId: user.id, stage: "INVESTIGATION", note: "Reopened by complainant." } },
    },
  });
  await notifyAdmins({
    type: "complaint.reopened",
    title: `Complaint ${complaint.caseRef} reopened`,
    body: `${user.name} reopened the case within the 7-day window.`,
    link: `/agent/complaints/${complaintId}`,
  });
  revalidatePath(`/agent/complaints/${complaintId}`);
}
