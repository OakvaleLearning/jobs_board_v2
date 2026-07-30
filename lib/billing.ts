import { prisma } from "@/lib/prisma";
import { placementFeeFor } from "@/lib/contracts";

/** Next sequential invoice number, e.g. OAK-INV-0007. */
export async function nextInvoiceNumber(): Promise<string> {
  const count = await prisma.invoice.count();
  return `OAK-INV-${String(count + 1).padStart(4, "0")}`;
}

/**
 * Issues the placement-fee invoice for a newly-activated placement (idempotent).
 * NGN only; 30-day net terms per the corporate procurement model.
 */
export async function issuePlacementInvoice(placementId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: { include: { employerType: true } } },
  });
  if (!placement) return null;

  const existing = await prisma.invoice.findFirst({
    where: { placementId, type: "PLACEMENT_FEE" },
  });
  if (existing) return existing;

  const amount = placementFeeFor(placement.employer.employerType?.config);
  const dueAt = new Date();
  dueAt.setDate(dueAt.getDate() + 30);

  return prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      employerId: placement.employerId,
      placementId,
      type: "PLACEMENT_FEE",
      amount,
      currency: "NGN",
      status: "ISSUED",
      dueAt,
      lineItems: [{ description: `Placement fee — ${placement.roleTitle}`, amount }],
    },
  });
}
