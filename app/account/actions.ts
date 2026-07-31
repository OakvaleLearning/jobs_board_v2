"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireUser, getCurrentDbUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { accountDetailsSchema, changePasswordSchema } from "@/lib/validation/account";
import { zodFieldErrors, type FormState } from "@/lib/forms";

export async function saveAccountDetails(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = accountDetailsSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  await prisma.user.update({
    where: { id: user.id },
    data: { name: parsed.data.name, phone: parsed.data.phone },
  });

  await audit({
    userId: user.id,
    action: "user.account.details_saved",
    entityType: "User",
    entityId: user.id,
  });
  revalidatePath("/account");
  return { ok: true, message: "Account details saved." };
}

export async function changePassword(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const dbUser = await getCurrentDbUser();
  if (!dbUser) return { ok: false, message: "Your session has expired. Please log in again." };

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const matches = await bcrypt.compare(parsed.data.currentPassword, dbUser.passwordHash);
  if (!matches) {
    return { ok: false, fieldErrors: { currentPassword: "Current password is incorrect." } };
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.user.update({ where: { id: dbUser.id }, data: { passwordHash } });

  await audit({
    userId: dbUser.id,
    action: "user.account.password_changed",
    entityType: "User",
    entityId: dbUser.id,
  });
  return { ok: true, message: "Password changed." };
}
