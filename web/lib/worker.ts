import { prisma } from "@/lib/prisma";
import { SEARCHABLE_THRESHOLD } from "@/lib/constants";
import { cpdStatus } from "@/lib/placement";
import type { DocumentType } from "@/generated/prisma/client";

const ID_TYPES: DocumentType[] = ["NIN", "PASSPORT", "VOTER_CARD", "DRIVERS_LICENCE"];
const CONDUCT_TYPES: DocumentType[] = ["POLICE_REPORT", "GUARANTOR_LETTER", "AFFIDAVIT"];

/**
 * Recomputes a worker's profile completion percentage and searchable flag.
 * Called after every profile mutation so the number is always server-derived.
 *
 * Weights (sum 100):
 *  personal 20 · category+preferences 15 · statement 10 · education 10 ·
 *  experience 10 · ID document 10 · selfie 5 · address proof 5 ·
 *  conduct documents 5 · certificate upload 10
 */
export async function recomputeWorkerCompletion(workerId: string) {
  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerId },
    include: {
      educations: { select: { id: true } },
      experiences: { select: { id: true } },
      documents: { select: { type: true } },
    },
  });
  if (!worker) return null;

  // CPD overdue removes a worker from search until they refresh (brief §8.3).
  const cpdOverdue = cpdStatus(worker.cpdNextDueAt) === "OVERDUE";

  const docTypes = new Set(worker.documents.map((d) => d.type));

  let pct = 0;
  const personalDone =
    !!worker.dateOfBirth && !!worker.gender && !!worker.state && !!worker.lga && !!worker.address;
  if (personalDone) pct += 20;

  const prefsDone =
    !!worker.workforceCategoryId &&
    worker.employmentTypes.length > 0 &&
    worker.languages.length > 0 &&
    !!worker.experienceLevel &&
    !!worker.expectedSalaryMin;
  if (prefsDone) pct += 15;

  if (worker.personalStatement && worker.personalStatement.length >= 30) pct += 10;
  if (worker.educations.length > 0) pct += 10;
  if (worker.experiences.length > 0) pct += 10;
  if (ID_TYPES.some((t) => docTypes.has(t))) pct += 10;
  if (docTypes.has("SELFIE")) pct += 5;
  if (docTypes.has("ADDRESS_PROOF")) pct += 5;
  if (CONDUCT_TYPES.some((t) => docTypes.has(t))) pct += 5;
  if (docTypes.has("CERTIFICATE")) pct += 10;

  const searchable =
    pct >= SEARCHABLE_THRESHOLD &&
    worker.profileStatus === "APPROVED" &&
    worker.certStatus === "APPROVED" &&
    !cpdOverdue;

  await prisma.workerProfile.update({
    where: { id: workerId },
    data: { completionPercent: pct, searchable },
  });

  return pct;
}

/**
 * The dual application gate: profile approved AND certificate approved.
 * Returns a plain-language reason when blocked, or null when clear.
 */
export function applicationBlockReason(worker: {
  profileStatus: string;
  certStatus: string;
  completionPercent: number;
}): string | null {
  if (worker.completionPercent < SEARCHABLE_THRESHOLD) {
    return `Your profile is ${worker.completionPercent}% complete. Reach at least ${SEARCHABLE_THRESHOLD}% to apply for jobs.`;
  }
  if (worker.profileStatus === "SUSPENDED") {
    return "Your account is suspended. Contact Oakvale support.";
  }
  if (worker.profileStatus !== "APPROVED") {
    return "Your profile has not been approved yet. Oakvale reviews profiles within 2 working days of submission.";
  }
  if (worker.certStatus !== "APPROVED") {
    return "Your Oakvale certificate has not been verified yet. Upload it from your profile if you haven't, and our team will review it.";
  }
  return null;
}

export async function getWorkerProfileByUserId(userId: string) {
  return prisma.workerProfile.findUnique({
    where: { userId },
    include: {
      workforceCategory: true,
      educations: { orderBy: { createdAt: "asc" } },
      experiences: { orderBy: { createdAt: "asc" } },
      references: { orderBy: { createdAt: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });
}
