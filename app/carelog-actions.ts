"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { sendCareLogDigest } from "@/lib/carelogs";
import { invalidForm, type FormState } from "@/lib/forms";

/**
 * US-4.1 — the caregiver's care log submission.
 *
 * Every field is optional beyond the date: a caregiver records what actually
 * happened on the shift, and an empty entry is rejected rather than filed.
 */
const careLogSchema = z
  .object({
    workspaceId: z.string().min(1),
    loggedFor: z.string().min(1, "Choose the date this entry covers."),
    bloodPressure: z
      .string()
      .trim()
      .regex(/^\d{2,3}\/\d{2,3}$/, "Use the form 120/80.")
      .optional()
      .or(z.literal("")),
    temperature: z.coerce.number().min(30).max(45).optional().or(z.literal("")),
    pulse: z.coerce.number().int().min(20).max(250).optional().or(z.literal("")),
    weight: z.coerce.number().min(1).max(400).optional().or(z.literal("")),
    medicationsTaken: z.string().trim().max(500).optional(),
    medicationTime: z.string().trim().max(100).optional(),
    meals: z.string().trim().max(500).optional(),
    activities: z.string().trim().max(500).optional(),
    mood: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(2000).optional(),
    concernFlag: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const recorded = [
      data.bloodPressure,
      data.temperature,
      data.pulse,
      data.weight,
      data.medicationsTaken,
      data.meals,
      data.activities,
      data.mood,
      data.notes,
    ].some((v) => v !== undefined && v !== "" && v !== null);
    if (!recorded) {
      ctx.addIssue({
        code: "custom",
        path: ["notes"],
        message: "Record at least one observation before submitting.",
      });
    }
  });

/** Files a care log entry. Caregiver-only, and only for their own placement. */
export async function submitCareLog(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireRole("WORKER");

  const parsed = careLogSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    loggedFor: formData.get("loggedFor"),
    bloodPressure: formData.get("bloodPressure") || undefined,
    temperature: formData.get("temperature") || undefined,
    pulse: formData.get("pulse") || undefined,
    weight: formData.get("weight") || undefined,
    medicationsTaken: formData.get("medicationsTaken") || undefined,
    medicationTime: formData.get("medicationTime") || undefined,
    meals: formData.get("meals") || undefined,
    activities: formData.get("activities") || undefined,
    mood: formData.get("mood") || undefined,
    notes: formData.get("notes") || undefined,
    concernFlag: formData.get("concernFlag") === "on",
  });
  if (!parsed.success) return invalidForm(formData, parsed.error);
  const d = parsed.data;

  // The workspace must belong to an active placement of this caregiver.
  const workspace = await prisma.careLogWorkspace.findFirst({
    where: {
      id: d.workspaceId,
      active: true,
      placement: { status: "ACTIVE", worker: { userId: user.id } },
    },
    include: {
      placement: { include: { employer: true, worker: { include: { user: true } } } },
    },
  });
  if (!workspace) return { ok: false, message: "Care log not found." };

  const num = (v: unknown) => (v === "" || v === undefined ? null : Number(v));

  const entry = await prisma.careLogEntry.create({
    data: {
      workspaceId: workspace.id,
      workerId: workspace.placement.workerId,
      loggedFor: new Date(d.loggedFor),
      bloodPressure: d.bloodPressure || null,
      temperature: num(d.temperature),
      pulse: num(d.pulse),
      weight: num(d.weight),
      medicationsTaken: d.medicationsTaken || null,
      medicationTime: d.medicationTime || null,
      meals: d.meals || null,
      activities: d.activities || null,
      mood: d.mood || null,
      notes: d.notes || null,
      concernFlag: d.concernFlag ?? false,
    },
  });

  // Touch the workspace so the sponsor's list sorts by genuine activity.
  await prisma.careLogWorkspace.update({
    where: { id: workspace.id },
    data: { updatedAt: new Date() },
  });

  await audit({
    userId: user.id,
    action: "carelog.entry.created",
    entityType: "CareLogEntry",
    entityId: entry.id,
    meta: { concern: entry.concernFlag },
  });

  await notify({
    userId: workspace.placement.employer.userId,
    type: "carelog.entry",
    title: entry.concernFlag ? "Care log flagged for attention" : "New care log entry",
    body: `${workspace.placement.worker.user.name} filed an update for "${workspace.placement.roleTitle}".`,
    link: `/employer/care-logs/${workspace.id}`,
  });

  // A flagged entry is sent immediately; routine entries batch into a digest.
  await sendCareLogDigest(workspace.id, { urgent: entry.concernFlag });

  revalidatePath("/worker/care-logs");
  revalidatePath(`/employer/care-logs/${workspace.id}`);
  return { ok: true, message: "Care log submitted. Your sponsor has been notified." };
}
