"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { z } from "zod";
import type { ContractType } from "@/generated/prisma/client";

const schema = z.object({
  type: z.enum(["WORKER_PLACEMENT", "EMPLOYER_SERVICE", "ANNUAL_PARTNERSHIP"]),
  name: z.string().trim().min(3, "Enter a template name."),
  body: z.string().trim().min(40, "The template body looks too short."),
});

/** Creates a new active template version for a contract type, retiring the prior active one. */
export async function saveTemplate(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");
  const parsed = schema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const type = parsed.data.type as ContractType;
  const current = await prisma.contractTemplate.findFirst({
    where: { type, active: true, deletedAt: null },
    orderBy: { version: "desc" },
  });

  await prisma.$transaction(async (tx) => {
    if (current) await tx.contractTemplate.update({ where: { id: current.id }, data: { active: false } });
    await tx.contractTemplate.create({
      data: {
        type,
        name: parsed.data.name,
        body: parsed.data.body,
        version: (current?.version ?? 0) + 1,
        active: true,
      },
    });
  });

  await audit({ userId: admin.id, action: "contract_template.saved", meta: { type } });
  revalidatePath("/admin/templates");
  return { ok: true, message: "Template saved. New placements will use this version." };
}

export async function toggleTemplateActive(id: string, active: boolean) {
  const admin = await requireRole("ADMIN");
  await prisma.contractTemplate.update({ where: { id }, data: { active } });
  await audit({ userId: admin.id, action: "contract_template.toggled", entityId: id, meta: { active } });
  revalidatePath("/admin/templates");
}
