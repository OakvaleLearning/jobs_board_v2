"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { recomputeMatchingWeights } from "@/lib/matching";
import { DEFAULT_MATCH_WEIGHTS, type MatchFactor } from "@/lib/constants";
import { zodFieldErrors, type FormState } from "@/lib/forms";

const weightSchema = z.coerce.number().min(0, "Must be 0 or more").max(100, "Keep weights ≤ 100");
const schema = z.object({
  category: weightSchema,
  location: weightSchema,
  relocate: weightSchema,
  employmentType: weightSchema,
  availability: weightSchema,
  rating: weightSchema,
});

/** Admin saves the base weights, then re-derives the learned weights from outcomes. */
export async function saveBaseWeights(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = schema.safeParse({
    category: formData.get("category"),
    location: formData.get("location"),
    relocate: formData.get("relocate"),
    employmentType: formData.get("employmentType"),
    availability: formData.get("availability"),
    rating: formData.get("rating"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const baseWeights = parsed.data as Record<MatchFactor, number>;
  await prisma.matchingModel.upsert({
    where: { id: "default" },
    update: { baseWeights },
    create: { id: "default", baseWeights },
  });

  await audit({ userId: admin.id, action: "matching.base_weights.saved", meta: baseWeights });
  await recomputeMatchingWeights();
  revalidatePath("/admin/matching");
  return { ok: true, message: "Base weights saved and effective weights recomputed." };
}

/** Manually re-run the outcome-learning step. */
export async function recomputeNow() {
  const admin = await requireRole("ADMIN");
  const model = await recomputeMatchingWeights();
  await audit({ userId: admin.id, action: "matching.recomputed", meta: { sampleSize: model.sampleSize } });
  revalidatePath("/admin/matching");
}

/** Reset base weights to the code defaults. */
export async function resetToDefaults() {
  const admin = await requireRole("ADMIN");
  await prisma.matchingModel.upsert({
    where: { id: "default" },
    update: { baseWeights: DEFAULT_MATCH_WEIGHTS },
    create: { id: "default", baseWeights: DEFAULT_MATCH_WEIGHTS },
  });
  await audit({ userId: admin.id, action: "matching.reset_defaults" });
  await recomputeMatchingWeights();
  revalidatePath("/admin/matching");
}
