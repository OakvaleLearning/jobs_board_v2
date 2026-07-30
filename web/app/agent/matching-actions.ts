"use server";

import { revalidatePath } from "next/cache";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

/** Agent sends a matched worker to an employer's shortlist for a job (brief §6.4). */
export async function sendShortlistFromMatch(jobId: string, workerId: string) {
  const agent = await requireAgent();
  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { employer: true } });
  if (!job) return;

  await prisma.shortlist.upsert({
    where: { employerId_workerId_jobId: { employerId: job.employerId, workerId, jobId } },
    update: {},
    create: { employerId: job.employerId, workerId, jobId, note: `Matched by ${agent.name}` },
  });

  await audit({ userId: agent.id, action: "match.shortlisted", entityType: "Job", entityId: jobId, meta: { workerId } });
  await notify({
    userId: job.employer.userId,
    type: "shortlist.match",
    title: "Oakvale matched a candidate",
    body: `Your account manager added a verified worker to your shortlist for "${job.title}".`,
    link: "/employer/shortlists",
    email: true,
  });

  revalidatePath(`/agent/matching`);
}
