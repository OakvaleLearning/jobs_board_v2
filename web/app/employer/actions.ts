"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { storage } from "@/lib/storage";
import { notifyAdmins } from "@/lib/notifications";
import { employerOnboardingSchema } from "@/lib/validation/employer";
import { zodFieldErrors, type FormState } from "@/lib/forms";

export async function saveEmployerOnboarding(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const user = await requireRole("EMPLOYER");

  const parsed = employerOnboardingSchema.safeParse({
    kind: formData.get("kind"),
    contactName: formData.get("contactName"),
    country: formData.get("country"),
    address: formData.get("address"),
    orgName: formData.get("orgName") || undefined,
    sector: formData.get("sector") || undefined,
    cacNumber: formData.get("cacNumber") || undefined,
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };
  const data = parsed.data;

  const existing = await prisma.employerProfile.findUnique({ where: { userId: user.id } });

  // Match to a configured employer type by kind (extensible taxonomy).
  const employerType = await prisma.employerType.findFirst({
    where: { kind: data.kind, active: true, deletedAt: null },
  });

  const isNew = !existing;
  const profile = await prisma.employerProfile.upsert({
    where: { userId: user.id },
    update: {
      kind: data.kind,
      employerTypeId: employerType?.id,
      contactName: data.contactName,
      country: data.country,
      address: data.address,
      orgName: data.kind === "ORGANIZATION" ? data.orgName : null,
      sector: data.kind === "ORGANIZATION" ? data.sector : null,
      cacNumber: data.kind === "ORGANIZATION" ? data.cacNumber : null,
    },
    create: {
      userId: user.id,
      kind: data.kind,
      employerTypeId: employerType?.id,
      contactName: data.contactName,
      country: data.country,
      address: data.address,
      orgName: data.kind === "ORGANIZATION" ? data.orgName : null,
      sector: data.kind === "ORGANIZATION" ? data.sector : null,
      cacNumber: data.kind === "ORGANIZATION" ? data.cacNumber : null,
    },
  });

  // Handle CAC document upload for organizations.
  const cacFile = formData.get("cacFile");
  if (data.kind === "ORGANIZATION" && cacFile instanceof File && cacFile.size > 0) {
    try {
      const stored = await storage.save(cacFile, { folder: `employers/${profile.id}` });
      await prisma.employerDocument.deleteMany({ where: { employerId: profile.id, type: "CAC" } });
      await prisma.employerDocument.create({
        data: {
          employerId: profile.id,
          type: "CAC",
          fileUrl: stored.url,
          fileName: stored.fileName,
        },
      });
    } catch (err) {
      return {
        ok: false,
        fieldErrors: { cacFile: err instanceof Error ? err.message : "CAC upload failed." },
      };
    }
  }

  await audit({
    userId: user.id,
    action: isNew ? "employer.onboarding.created" : "employer.onboarding.updated",
    entityType: "EmployerProfile",
    entityId: profile.id,
  });

  if (isNew) {
    await notifyAdmins({
      type: "employer.registered",
      title: "New employer registration",
      body: `${data.orgName ?? data.contactName} (${data.kind.toLowerCase()}) needs verification.`,
      link: "/admin/employers",
    });
  }

  revalidatePath("/employer");
  revalidatePath("/employer/onboarding");
  // Keep the downstream intake form in sync with the saved company profile
  // (fixes stale sector/kind copy appearing in the assessment form).
  revalidatePath("/employer/assessment");
  return {
    ok: true,
    message: isNew
      ? "Profile submitted. Oakvale will verify your account within 2 working days."
      : "Company profile updated.",
  };
}
