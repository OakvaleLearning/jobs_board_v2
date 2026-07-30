"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { getEmployerProfileByUserId } from "@/lib/employer";
import { assessmentTypeForKind, fieldsForType } from "@/lib/assessments";
import type { FormState } from "@/lib/forms";

/** Saves the intake form matching the employer's kind (auto-derived — never hardcoded). */
export async function saveAssessment(_p: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("EMPLOYER");
  const employer = await getEmployerProfileByUserId(user.id);
  if (!employer) return { ok: false, message: "Complete your company profile first." };

  const type = assessmentTypeForKind(employer.kind);
  const fields = fieldsForType(type);
  const data: Record<string, string> = {};
  for (const f of fields) {
    const v = formData.get(f.name);
    if (typeof v === "string" && v.trim()) data[f.name] = v.trim();
  }

  await prisma.assessment.upsert({
    where: { employerId_type: { employerId: employer.id, type } },
    update: { data, submittedAt: new Date() },
    create: { employerId: employer.id, type, data, submittedAt: new Date() },
  });

  await audit({ userId: user.id, action: "assessment.saved", entityType: "Assessment", meta: { type } });
  revalidatePath("/employer/assessment");
  return { ok: true, message: "Assessment saved. Your account manager can now match candidates." };
}
