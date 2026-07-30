"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { recomputeWorkerCompletion } from "@/lib/worker";

// ---------------------------------------------------------------------------
// Employer verification
// ---------------------------------------------------------------------------

export async function decideEmployer(employerId: string, approve: boolean, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const employer = await prisma.employerProfile.update({
    where: { id: employerId },
    data: {
      verificationStatus: approve ? "APPROVED" : "REJECTED",
      reviewNotes: notes || null,
    },
  });
  await audit({
    userId: admin.id,
    action: approve ? "employer.approved" : "employer.rejected",
    entityType: "EmployerProfile",
    entityId: employerId,
  });
  await notify({
    userId: employer.userId,
    type: "employer.verification",
    title: approve ? "Your account is verified" : "Account verification update",
    body: approve
      ? "You can now post jobs and search verified workers."
      : `Your verification could not be completed. ${notes ?? ""}`.trim(),
    link: "/employer",
    email: true,
  });
  revalidatePath("/admin/employers");
}

// ---------------------------------------------------------------------------
// Worker profile approval
// ---------------------------------------------------------------------------

export async function decideWorkerProfile(workerId: string, approve: boolean, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const worker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: {
      profileStatus: approve ? "APPROVED" : "REJECTED",
      reviewNotes: notes || null,
    },
  });
  await recomputeWorkerCompletion(workerId);
  await audit({
    userId: admin.id,
    action: approve ? "worker.profile.approved" : "worker.profile.rejected",
    entityType: "WorkerProfile",
    entityId: workerId,
  });
  await notify({
    userId: worker.userId,
    type: "worker.profile.decision",
    title: approve ? "Your profile is approved" : "Profile needs changes",
    body: approve
      ? "Your profile is now visible to employers. Once your certificate is verified you can apply to jobs."
      : `Please review the feedback and resubmit. ${notes ?? ""}`.trim(),
    link: "/worker/profile",
    email: true,
  });
  revalidatePath("/admin/workers");
}

export async function suspendWorker(workerId: string, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const worker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: { profileStatus: "SUSPENDED", searchable: false, reviewNotes: notes || null },
  });
  await audit({ userId: admin.id, action: "worker.suspended", entityType: "WorkerProfile", entityId: workerId });
  await notify({
    userId: worker.userId,
    type: "worker.suspended",
    title: "Your account has been suspended",
    body: notes || "Contact Oakvale support for details.",
    email: true,
  });
  revalidatePath("/admin/workers");
}

// ---------------------------------------------------------------------------
// Certificate cross-check
// ---------------------------------------------------------------------------

export async function decideCertificate(workerId: string, approve: boolean, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const worker = await prisma.workerProfile.update({
    where: { id: workerId },
    data: { certStatus: approve ? "APPROVED" : "REJECTED", reviewNotes: notes || null },
  });
  // Also mark the certificate document itself.
  await prisma.workerDocument.updateMany({
    where: { workerId, type: "CERTIFICATE" },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });
  await recomputeWorkerCompletion(workerId);
  await audit({
    userId: admin.id,
    action: approve ? "certificate.approved" : "certificate.rejected",
    entityType: "WorkerProfile",
    entityId: workerId,
  });
  await notify({
    userId: worker.userId,
    type: "certificate.decision",
    title: approve ? "Certificate verified" : "Certificate could not be verified",
    body: approve
      ? "Your Oakvale certificate is verified. Once your profile is approved you can apply to jobs."
      : `Please re-upload a clear copy of your certificate. ${notes ?? ""}`.trim(),
    link: "/worker/profile",
    email: true,
  });
  revalidatePath("/admin/certificates");
}

// ---------------------------------------------------------------------------
// Job post review
// ---------------------------------------------------------------------------

export async function decideJob(jobId: string, approve: boolean, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const job = await prisma.job.update({
    where: { id: jobId },
    data: { status: approve ? "APPROVED" : "REJECTED", reviewNotes: notes || null },
    include: { employer: true },
  });
  await audit({
    userId: admin.id,
    action: approve ? "job.approved" : "job.rejected",
    entityType: "Job",
    entityId: jobId,
  });
  await notify({
    userId: job.employer.userId,
    type: "job.decision",
    title: approve ? "Your job post is live" : "Job post needs revision",
    body: approve
      ? `"${job.title}" is now visible to workers.`
      : `"${job.title}" needs changes before it can go live. ${notes ?? ""}`.trim(),
    link: "/employer/jobs",
    email: true,
  });
  revalidatePath("/admin/jobs");
}
