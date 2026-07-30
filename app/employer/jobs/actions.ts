"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notifyAdmins } from "@/lib/notifications";
import { employerBlockReason } from "@/lib/employer";
import { jobSchema } from "@/lib/validation/job";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import type { EmploymentType } from "@/generated/prisma/client";

export async function createJob(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("EMPLOYER");
  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });

  const block = employerBlockReason(employer);
  if (block) return { ok: false, message: block };

  const parsed = jobSchema.safeParse({
    title: formData.get("title"),
    workforceCategoryId: formData.get("workforceCategoryId"),
    careTypeIds: formData.getAll("careTypeIds"),
    description: formData.get("description"),
    state: formData.get("state") || undefined,
    lga: formData.get("lga") || undefined,
    employmentType: formData.get("employmentType"),
    salaryMin: formData.get("salaryMin") || undefined,
    salaryMax: formData.get("salaryMax") || undefined,
    salaryCurrency: formData.get("salaryCurrency"),
    backgroundCheckRequired: formData.get("backgroundCheckRequired") === "on",
    visibility: formData.get("visibility"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const data = parsed.data;

  const job = await prisma.job.create({
    data: {
      employerId: employer!.id,
      title: data.title,
      workforceCategoryId: data.workforceCategoryId,
      description: data.description,
      state: data.state,
      lga: data.lga,
      employmentType: data.employmentType as EmploymentType,
      salaryMin: data.salaryMin ?? null,
      salaryMax: data.salaryMax ?? null,
      salaryCurrency: data.salaryCurrency,
      backgroundCheckRequired: data.backgroundCheckRequired,
      visibility: data.visibility,
      status: "PENDING_REVIEW",
      careTypes: {
        create: data.careTypeIds.map((careTypeId) => ({ careTypeId })),
      },
    },
  });

  await audit({ userId: user.id, action: "job.created", entityType: "Job", entityId: job.id });
  await notifyAdmins({
    type: "job.review",
    title: "Job post awaiting review",
    body: `${employer!.orgName ?? user.name} posted "${data.title}".`,
    link: "/admin/jobs",
  });

  redirect("/employer/jobs");
}

export async function closeJob(jobId: string) {
  const user = await requireRole("EMPLOYER");
  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
  await prisma.job.updateMany({
    where: { id: jobId, employerId: employer?.id },
    data: { status: "CLOSED" },
  });
  await audit({ userId: user.id, action: "job.closed", entityType: "Job", entityId: jobId });
  revalidatePath("/employer/jobs");
}
