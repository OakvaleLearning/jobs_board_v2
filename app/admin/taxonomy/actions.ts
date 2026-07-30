"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { z } from "zod";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nameSchema = z.object({
  name: z.string().trim().min(2, "Enter a name."),
  description: z.string().trim().max(500).optional(),
});

export async function createWorkforceCategory(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = nameSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const slug = slugify(parsed.data.name);
  const exists = await prisma.workforceCategory.findUnique({ where: { slug } });
  if (exists) return { ok: false, fieldErrors: { name: "A similar category already exists." } };

  await prisma.workforceCategory.create({
    data: { name: parsed.data.name, slug, description: parsed.data.description },
  });
  await audit({ userId: admin.id, action: "taxonomy.workforce_category.created", meta: { slug } });
  revalidatePath("/admin/taxonomy");
  return { ok: true, message: "Workforce category added." };
}

export async function createEmployerType(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = nameSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const kind = formData.get("kind") === "ORGANIZATION" ? "ORGANIZATION" : "INDIVIDUAL";

  const slug = slugify(parsed.data.name);
  if (await prisma.employerType.findUnique({ where: { slug } })) {
    return { ok: false, fieldErrors: { name: "A similar type already exists." } };
  }
  await prisma.employerType.create({
    data: { name: parsed.data.name, slug, description: parsed.data.description, kind },
  });
  await audit({ userId: admin.id, action: "taxonomy.employer_type.created", meta: { slug } });
  revalidatePath("/admin/taxonomy");
  return { ok: true, message: "Employer type added." };
}

export async function createCareType(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = nameSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const category = (formData.get("category") as string)?.trim() || null;

  const slug = slugify(parsed.data.name);
  if (await prisma.careType.findUnique({ where: { slug } })) {
    return { ok: false, fieldErrors: { name: "A similar care type already exists." } };
  }
  await prisma.careType.create({
    data: { name: parsed.data.name, slug, description: parsed.data.description, category },
  });
  await audit({ userId: admin.id, action: "taxonomy.care_type.created", meta: { slug, category } });
  revalidatePath("/admin/taxonomy");
  return { ok: true, message: "Care type added." };
}

/** Reassign a care type's grouping category (admin-editable). */
export async function setCareTypeCategory(id: string, category: string) {
  const admin = await requireRole("ADMIN");
  const value = category.trim() || null;
  await prisma.careType.update({ where: { id }, data: { category: value } });
  await audit({
    userId: admin.id,
    action: "taxonomy.care_type.recategorised",
    entityType: "careType",
    entityId: id,
    meta: { category: value },
  });
  revalidatePath("/admin/taxonomy");
}

type Entity = "workforceCategory" | "employerType" | "careType";

export async function toggleTaxonomyActive(entity: Entity, id: string, active: boolean) {
  const admin = await requireRole("ADMIN");
  if (entity === "workforceCategory") {
    await prisma.workforceCategory.update({ where: { id }, data: { active } });
  } else if (entity === "employerType") {
    await prisma.employerType.update({ where: { id }, data: { active } });
  } else {
    await prisma.careType.update({ where: { id }, data: { active } });
  }
  await audit({ userId: admin.id, action: "taxonomy.toggled", entityType: entity, entityId: id, meta: { active } });
  revalidatePath("/admin/taxonomy");
}
