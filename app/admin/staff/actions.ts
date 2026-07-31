"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { zodFieldErrors, type FormState } from "@/lib/forms";
import { createStaffSchema } from "@/lib/validation/staff";

const roleLabels: Record<"ADMIN" | "AGENT", string> = {
  ADMIN: "Admin",
  AGENT: "Agent",
};

export async function createStaff(_p: FormState, formData: FormData): Promise<FormState> {
  const admin = await requireRole("ADMIN");

  const parsed = createStaffSchema.safeParse({
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const { role, name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { ok: false, fieldErrors: { email: "A user with this email already exists." } };

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash, role, name, phone: phone || null },
  });

  await audit({
    userId: admin.id,
    action: "user.staff.created",
    entityType: "User",
    entityId: user.id,
    meta: { role, email },
  });
  revalidatePath("/admin/staff");
  return { ok: true, message: `${roleLabels[role]} account created for ${name}.` };
}

export async function setStaffActive(id: string, active: boolean) {
  const admin = await requireRole("ADMIN");
  // Never let an admin lock themselves out.
  if (id === admin.id) return;

  await prisma.user.update({
    where: { id },
    data: { deletedAt: active ? null : new Date() },
  });
  await audit({
    userId: admin.id,
    action: active ? "user.staff.reactivated" : "user.staff.deactivated",
    entityType: "User",
    entityId: id,
  });
  revalidatePath("/admin/staff");
}
