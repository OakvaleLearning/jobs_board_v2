"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";

/** Oakvale releases an offer to the worker (or sends it back to the employer). */
export async function decideOffer(offerId: string, approve: boolean, notes?: string) {
  const admin = await requireRole("ADMIN", "AGENT");
  const offer = await prisma.offer.findUnique({
    where: { id: offerId },
    include: {
      application: { include: { worker: { include: { user: true } }, job: { include: { employer: true } } } },
    },
  });
  if (!offer) return;

  await prisma.offer.update({
    where: { id: offerId },
    data: { status: approve ? "SENT" : "NEGOTIATE" },
  });

  await audit({
    userId: admin.id,
    action: approve ? "offer.released" : "offer.returned",
    entityType: "Offer",
    entityId: offerId,
  });

  if (approve) {
    await notify({
      userId: offer.application.worker.user.id,
      type: "offer.received",
      title: "You have a job offer",
      body: `You've received an offer for "${offer.application.job.title}". Review and respond.`,
      link: "/worker/applications",
      email: true,
    });
  } else {
    await notify({
      userId: offer.application.job.employer.userId,
      type: "offer.returned",
      title: "Offer needs revision",
      body: `Oakvale asked for changes to your offer. ${notes ?? ""}`.trim(),
      link: `/employer/jobs/${offer.application.jobId}`,
      email: true,
    });
  }

  revalidatePath("/admin/offers");
}
