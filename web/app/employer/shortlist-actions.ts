"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

async function requireEmployer() {
  const user = await requireRole("EMPLOYER");
  const employer = await prisma.employerProfile.findUnique({ where: { userId: user.id } });
  return { user, employer };
}

export async function toggleShortlist(workerId: string) {
  const { user, employer } = await requireEmployer();
  if (!employer || employer.verificationStatus !== "APPROVED") return;

  const existing = await prisma.shortlist.findFirst({
    where: { employerId: employer.id, workerId, jobId: null },
  });

  if (existing) {
    await prisma.shortlist.delete({ where: { id: existing.id } });
    await audit({ userId: user.id, action: "shortlist.removed", entityType: "WorkerProfile", entityId: workerId });
  } else {
    await prisma.shortlist.create({ data: { employerId: employer.id, workerId } });
    await audit({ userId: user.id, action: "shortlist.added", entityType: "WorkerProfile", entityId: workerId });
  }

  revalidatePath("/employer/workers");
  revalidatePath("/employer/shortlists");
  revalidatePath(`/employer/workers/${workerId}`);
}
