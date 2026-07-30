"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { audit } from "@/lib/audit";
import { notifyAdmins } from "@/lib/notifications";
import { signupSchema, loginSchema } from "@/lib/validation/auth";
import { zodFieldErrors, type FormState } from "@/lib/forms";

export async function signupAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = {
    role: formData.get("role"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    referralSource: formData.get("referralSource") || undefined,
    referrerName: formData.get("referrerName") || undefined,
  };

  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { ok: false, fieldErrors: { email: "An account with this email already exists." } };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
      role: data.role,
      name: data.name,
      phone: data.phone,
      referralSource: data.referralSource,
      referrerName: data.referralSource === "PERSONAL_REFERRAL" ? data.referrerName : null,
      // Workers get a draft profile immediately so onboarding can auto-save.
      workerProfile: data.role === "WORKER" ? { create: {} } : undefined,
    },
  });

  await audit({ userId: user.id, action: "user.signup", entityType: "User", entityId: user.id, meta: { role: data.role } });

  if (data.role === "WORKER") {
    await notifyAdmins({
      type: "worker.signup",
      title: "New worker registration",
      body: `${data.name} has started registration.`,
      link: "/admin/workers",
    });
  }

  // Sign the user in, then send them to the right first screen.
  await signIn("credentials", {
    email: data.email,
    password: data.password,
    redirect: false,
  });

  redirect(data.role === "WORKER" ? "/worker/profile" : "/employer/onboarding");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, message: "Incorrect email or password." };
    }
    throw err;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  await audit({ userId: user?.id, action: "user.login", entityType: "User", entityId: user?.id });

  switch (user?.role) {
    case "WORKER":
      redirect("/worker");
    case "EMPLOYER":
      redirect("/employer");
    default:
      redirect("/admin");
  }
}
