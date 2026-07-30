"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { contractTypeLabels } from "@/lib/constants";

/**
 * Digital signing = authenticated action + consent + timestamp (brief §7.3).
 * The worker signs the Worker Placement Agreement; the employer signs the
 * Employer Service Agreement. Oakvale counter-signs at generation.
 */
export async function signContract(contractId: string) {
  const user = await requireUser();
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
    include: {
      placement: {
        include: {
          worker: { include: { user: true } },
          employer: { include: { user: true } },
        },
      },
    },
  });
  if (!contract) return;

  const signerUserId =
    contract.type === "WORKER_PLACEMENT"
      ? contract.placement.worker.userId
      : contract.placement.employer.userId;

  // Only the named party may sign their side of the agreement.
  if (user.id !== signerUserId) return;
  if (contract.status !== "AWAITING_SIGNATURE" || contract.partySignedAt) return;

  await prisma.contract.update({
    where: { id: contractId },
    data: { partySignedAt: new Date(), status: "EXECUTED" },
  });

  await audit({
    userId: user.id,
    action: "contract.signed",
    entityType: "Contract",
    entityId: contractId,
    meta: { type: contract.type },
  });

  // Notify the counterpart that their agreement now awaits (or is complete).
  const counterpartUserId =
    contract.type === "WORKER_PLACEMENT"
      ? contract.placement.employer.userId
      : contract.placement.worker.userId;
  await notify({
    userId: counterpartUserId,
    type: "contract.signed",
    title: `${contractTypeLabels[contract.type]} signed`,
    body: `${user.name} has signed the ${contractTypeLabels[contract.type]}.`,
    link:
      contract.type === "WORKER_PLACEMENT"
        ? `/employer/placements/${contract.placementId}`
        : `/worker/placements/${contract.placementId}`,
  });

  revalidatePath(`/worker/placements/${contract.placementId}`);
  revalidatePath(`/employer/placements/${contract.placementId}`);
  revalidatePath(`/agent/placements/${contract.placementId}`);
}
