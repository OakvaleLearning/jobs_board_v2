"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { storage } from "@/lib/storage";
import { notifyAdmins } from "@/lib/notifications";
import { recomputeWorkerCompletion } from "@/lib/worker";
import {
  personalSchema,
  preferencesSchema,
  educationSchema,
  experienceSchema,
  certificateDetailsSchema,
} from "@/lib/validation/worker";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import type { DocumentType, EmploymentType } from "@/generated/prisma/client";

async function requireWorkerProfile() {
  const user = await requireRole("WORKER");
  const profile = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  if (!profile) {
    // Should not happen (created at signup) but recover gracefully.
    return { user, profile: await prisma.workerProfile.create({ data: { userId: user.id } }) };
  }
  return { user, profile };
}

async function afterProfileChange(workerId: string, userId: string, action: string) {
  await recomputeWorkerCompletion(workerId);
  await audit({ userId, action, entityType: "WorkerProfile", entityId: workerId });
  revalidatePath("/worker/profile");
  revalidatePath("/worker");
}

export async function savePersonal(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();
  const parsed = personalSchema.safeParse({
    dateOfBirth: formData.get("dateOfBirth"),
    gender: formData.get("gender"),
    state: formData.get("state"),
    lga: formData.get("lga"),
    address: formData.get("address"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.workerProfile.update({
    where: { id: profile.id },
    data: {
      dateOfBirth: new Date(parsed.data.dateOfBirth),
      gender: parsed.data.gender,
      state: parsed.data.state,
      lga: parsed.data.lga,
      address: parsed.data.address,
    },
  });
  await afterProfileChange(profile.id, user.id, "worker.profile.personal_saved");
  return { ok: true, message: "Personal details saved." };
}

export async function savePreferences(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();
  const parsed = preferencesSchema.safeParse({
    workforceCategoryId: formData.get("workforceCategoryId"),
    employmentTypes: formData.getAll("employmentTypes"),
    languages: formData.getAll("languages"),
    willingToRelocate: formData.get("willingToRelocate") === "on",
    availabilityDate: formData.get("availabilityDate") || undefined,
    experienceLevel: formData.get("experienceLevel"),
    expectedSalaryMin: formData.get("expectedSalaryMin"),
    expectedSalaryMax: formData.get("expectedSalaryMax") || undefined,
    salaryCurrency: formData.get("salaryCurrency"),
    personalStatement: formData.get("personalStatement"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.workerProfile.update({
    where: { id: profile.id },
    data: {
      workforceCategoryId: parsed.data.workforceCategoryId,
      employmentTypes: parsed.data.employmentTypes as EmploymentType[],
      languages: parsed.data.languages,
      willingToRelocate: parsed.data.willingToRelocate,
      availabilityDate: parsed.data.availabilityDate ? new Date(parsed.data.availabilityDate) : null,
      experienceLevel: parsed.data.experienceLevel,
      expectedSalaryMin: parsed.data.expectedSalaryMin,
      expectedSalaryMax: parsed.data.expectedSalaryMax ?? null,
      salaryCurrency: parsed.data.salaryCurrency,
      personalStatement: parsed.data.personalStatement,
    },
  });
  await afterProfileChange(profile.id, user.id, "worker.profile.preferences_saved");
  return { ok: true, message: "Work preferences saved." };
}

export async function addEducation(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();
  const parsed = educationSchema.safeParse({
    institution: formData.get("institution"),
    qualification: formData.get("qualification"),
    startYear: formData.get("startYear") || undefined,
    endYear: formData.get("endYear") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.education.create({ data: { workerId: profile.id, ...parsed.data } });
  await afterProfileChange(profile.id, user.id, "worker.profile.education_added");
  return { ok: true, message: "Education added." };
}

export async function removeEducation(id: string): Promise<void> {
  const { user, profile } = await requireWorkerProfile();
  await prisma.education.deleteMany({ where: { id, workerId: profile.id } });
  await afterProfileChange(profile.id, user.id, "worker.profile.education_removed");
}

export async function addExperience(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();
  const parsed = experienceSchema.safeParse({
    employer: formData.get("employer"),
    roleTitle: formData.get("roleTitle"),
    startDate: formData.get("startDate") || undefined,
    endDate: formData.get("endDate") || undefined,
    current: formData.get("current") === "on",
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.experience.create({
    data: {
      workerId: profile.id,
      employer: parsed.data.employer,
      roleTitle: parsed.data.roleTitle,
      startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : null,
      endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null,
      current: parsed.data.current ?? false,
      description: parsed.data.description,
    },
  });
  await afterProfileChange(profile.id, user.id, "worker.profile.experience_added");
  return { ok: true, message: "Experience added." };
}

export async function removeExperience(id: string): Promise<void> {
  const { user, profile } = await requireWorkerProfile();
  await prisma.experience.deleteMany({ where: { id, workerId: profile.id } });
  await afterProfileChange(profile.id, user.id, "worker.profile.experience_removed");
}

const DOC_TYPES: DocumentType[] = [
  "NIN", "PASSPORT", "VOTER_CARD", "DRIVERS_LICENCE", "SELFIE", "ADDRESS_PROOF",
  "CERTIFICATE", "POLICE_REPORT", "GUARANTOR_LETTER", "AFFIDAVIT", "VIDEO_INTRO",
];

export async function uploadWorkerDocument(_prev: FormState, formData: FormData): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();

  const type = String(formData.get("type")) as DocumentType;
  if (!DOC_TYPES.includes(type)) {
    return { ok: false, message: "Unknown document type." };
  }
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, fieldErrors: { file: "Choose a file to upload." } };
  }

  let stored;
  try {
    stored = await storage.save(file, { folder: `workers/${profile.id}` });
  } catch (err) {
    return { ok: false, fieldErrors: { file: err instanceof Error ? err.message : "Upload failed. Try again." } };
  }

  // Replace any previous upload of the same document type.
  await prisma.workerDocument.deleteMany({ where: { workerId: profile.id, type } });
  await prisma.workerDocument.create({
    data: {
      workerId: profile.id,
      type,
      fileUrl: stored.url,
      fileName: stored.fileName,
    },
  });

  // A certificate upload (re)enters the admin cross-check queue.
  if (type === "CERTIFICATE") {
    const details = certificateDetailsSchema.safeParse({
      certificateNumber: formData.get("certificateNumber") || undefined,
      certProgramme: formData.get("certProgramme") || undefined,
      certCompletionDate: formData.get("certCompletionDate") || undefined,
    });
    await prisma.workerProfile.update({
      where: { id: profile.id },
      data: {
        certStatus: "PENDING",
        certificateNumber: details.success ? details.data.certificateNumber ?? null : null,
        certProgramme: details.success ? details.data.certProgramme ?? null : null,
        certCompletionDate:
          details.success && details.data.certCompletionDate
            ? new Date(details.data.certCompletionDate)
            : null,
      },
    });
    await notifyAdmins({
      type: "certificate.submitted",
      title: "Certificate submitted for review",
      body: `${user.name} uploaded an Oakvale certificate for cross-checking.`,
      link: "/admin/certificates",
    });
  }

  await afterProfileChange(profile.id, user.id, `worker.document.uploaded.${type}`);
  return { ok: true, message: "Document uploaded." };
}

/** Worker submits their profile for admin approval. */
export async function submitProfileForReview(): Promise<FormState> {
  const { user, profile } = await requireWorkerProfile();

  const pct = await recomputeWorkerCompletion(profile.id);
  if ((pct ?? 0) < 70) {
    return {
      ok: false,
      message: `Your profile is ${pct}% complete. Reach at least 70% before submitting for review.`,
    };
  }

  await prisma.workerProfile.update({
    where: { id: profile.id },
    data: { profileStatus: "PENDING" },
  });
  await notifyAdmins({
    type: "worker.profile.submitted",
    title: "Worker profile awaiting approval",
    body: `${user.name} submitted their profile for review.`,
    link: "/admin/workers",
  });
  await audit({ userId: user.id, action: "worker.profile.submitted", entityType: "WorkerProfile", entityId: profile.id });
  revalidatePath("/worker/profile");
  revalidatePath("/worker");
  return { ok: true, message: "Profile submitted. Oakvale will review it within 2 working days." };
}
