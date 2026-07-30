"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify, notifyAdmins } from "@/lib/notifications";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { z } from "zod";
import type { EmploymentType, InterviewFormat } from "@/generated/prisma/client";

/** Confirms the application belongs to a job owned by the current employer. */
async function ownedApplication(applicationId: string, userId: string) {
  return prisma.application.findFirst({
    where: { id: applicationId, job: { employer: { userId } } },
    include: { job: true, worker: { include: { user: true } } },
  });
}

const interviewSchema = z.object({
  format: z.enum(["IN_PERSON", "VIDEO", "PHONE"]),
  times: z.array(z.string().min(1)).min(1, "Propose at least one time.").max(5),
});

export async function requestInterview(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("EMPLOYER");
  const applicationId = String(formData.get("applicationId") || "");
  const app = await ownedApplication(applicationId, user.id);
  if (!app) return { ok: false, message: "Application not found." };

  const times = (formData.getAll("times") as string[]).filter(Boolean);
  const parsed = interviewSchema.safeParse({ format: formData.get("format"), times });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.interview.upsert({
    where: { applicationId },
    update: {
      format: parsed.data.format as InterviewFormat,
      proposedTimes: parsed.data.times,
      status: "PROPOSED",
      confirmedTime: null,
    },
    create: {
      applicationId,
      format: parsed.data.format as InterviewFormat,
      proposedTimes: parsed.data.times,
    },
  });
  await prisma.application.update({ where: { id: applicationId }, data: { status: "INTERVIEW" } });

  await audit({ userId: user.id, action: "interview.requested", entityType: "Application", entityId: applicationId });
  await notify({
    userId: app.worker.user.id,
    type: "interview.requested",
    title: "Interview requested",
    body: `You've been invited to interview for "${app.job.title}". Choose a time.`,
    link: "/worker/applications",
    email: true,
  });

  revalidatePath(`/employer/jobs/${app.jobId}`);
  return { ok: true, message: "Interview request sent to the worker." };
}

const offerSchema = z.object({
  roleTitle: z.string().trim().min(2, "Enter a role title."),
  startDate: z.string().min(1, "Choose a start date."),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"]),
  salary: z.coerce.number().int().positive("Enter a salary."),
  salaryCurrency: z.enum(["NGN", "GBP", "USD"]),
  hours: z.string().trim().optional(),
  location: z.string().trim().optional(),
  conditions: z.string().trim().optional(),
});

export async function makeOffer(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("EMPLOYER");
  const applicationId = String(formData.get("applicationId") || "");
  const app = await ownedApplication(applicationId, user.id);
  if (!app) return { ok: false, message: "Application not found." };

  const parsed = offerSchema.safeParse({
    roleTitle: formData.get("roleTitle"),
    startDate: formData.get("startDate"),
    employmentType: formData.get("employmentType"),
    salary: formData.get("salary"),
    salaryCurrency: formData.get("salaryCurrency"),
    hours: formData.get("hours") || undefined,
    location: formData.get("location") || undefined,
    conditions: formData.get("conditions") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const d = parsed.data;

  // Offers are reviewed by Oakvale before reaching the worker.
  await prisma.offer.upsert({
    where: { applicationId },
    update: {
      roleTitle: d.roleTitle,
      startDate: new Date(d.startDate),
      employmentType: d.employmentType as EmploymentType,
      salary: d.salary,
      salaryCurrency: d.salaryCurrency,
      hours: d.hours,
      location: d.location,
      conditions: d.conditions,
      status: "PENDING_ADMIN",
    },
    create: {
      applicationId,
      roleTitle: d.roleTitle,
      startDate: new Date(d.startDate),
      employmentType: d.employmentType as EmploymentType,
      salary: d.salary,
      salaryCurrency: d.salaryCurrency,
      hours: d.hours,
      location: d.location,
      conditions: d.conditions,
    },
  });
  await prisma.application.update({ where: { id: applicationId }, data: { status: "OFFER" } });

  await audit({ userId: user.id, action: "offer.created", entityType: "Application", entityId: applicationId });
  await notifyAdmins({
    type: "offer.review",
    title: "Offer awaiting review",
    body: `An offer for "${app.job.title}" needs Oakvale review before release.`,
    link: "/admin/offers",
  });

  revalidatePath(`/employer/jobs/${app.jobId}`);
  return { ok: true, message: "Offer submitted to Oakvale for review before it reaches the worker." };
}

export async function setApplicationStatus(applicationId: string, status: "SHORTLISTED" | "REJECTED") {
  const user = await requireRole("EMPLOYER");
  const app = await ownedApplication(applicationId, user.id);
  if (!app) return;
  await prisma.application.update({ where: { id: applicationId }, data: { status } });
  await audit({ userId: user.id, action: `application.${status.toLowerCase()}`, entityType: "Application", entityId: applicationId });
  if (status === "REJECTED") {
    await notify({
      userId: app.worker.user.id,
      type: "application.update",
      title: "Application update",
      body: `Your application for "${app.job.title}" is not progressing.`,
      link: "/worker/applications",
    });
  }
  revalidatePath(`/employer/jobs/${app.jobId}`);
}
