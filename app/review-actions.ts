"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser, requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { canReview, recomputeSubjectRating } from "@/lib/reviews";
import { recomputeMatchingWeights } from "@/lib/matching";
import { RATING_MIN_COMMENT } from "@/lib/constants";
import { zodFieldErrors, type FormState } from "@/lib/forms";

const schema = z.object({
  placementId: z.string().min(1),
  rating: z.coerce.number().int().min(1, "Please give a star rating.").max(5),
  comment: z
    .string()
    .trim()
    .min(RATING_MIN_COMMENT, `Please write at least ${RATING_MIN_COMMENT} characters.`)
    .max(2000),
});

/** A party (employer or worker) leaves — or updates — their review of the other. */
export async function submitReview(_p: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = schema.safeParse({
    placementId: formData.get("placementId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: zodFieldErrors(parsed.error) };

  const placement = await prisma.placement.findUnique({
    where: { id: parsed.data.placementId },
    include: { worker: { select: { userId: true } }, employer: { select: { userId: true } } },
  });
  if (!placement) return { ok: false, message: "Placement not found." };

  const direction = canReview(placement, user.id, user.role);
  if (!direction) {
    return { ok: false, message: "This placement is not open for review yet." };
  }

  const subjectId =
    direction === "EMPLOYER_ON_WORKER" ? placement.worker.userId : placement.employer.userId;

  await prisma.review.upsert({
    where: { placementId_direction: { placementId: placement.id, direction } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment, status: "PUBLISHED" },
    create: {
      placementId: placement.id,
      authorId: user.id,
      subjectId,
      direction,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  await recomputeSubjectRating(subjectId);
  await recomputeMatchingWeights();

  await audit({
    userId: user.id,
    action: "review.submitted",
    entityType: "Placement",
    entityId: placement.id,
    meta: { direction, rating: parsed.data.rating },
  });
  await notify({
    userId: subjectId,
    type: "review.received",
    title: "You received a review",
    body: `Your ${direction === "EMPLOYER_ON_WORKER" ? "employer" : "worker"} left a review on your placement "${placement.roleTitle}".`,
    link: user.role === "EMPLOYER" ? "/worker/placements" : "/employer/placements",
    email: true,
  });

  const rolePath = user.role === "EMPLOYER" ? "/employer" : "/worker";
  revalidatePath(`${rolePath}/placements/${placement.id}`);
  return { ok: true, message: "Thanks — your review has been posted." };
}

/** Staff hides an abusive review (recomputes the subject's rating). */
export async function hideReview(reviewId: string, reason: string) {
  const staff = await requireAgent();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status: "HIDDEN", hiddenById: staff.id, hiddenReason: reason || null },
  });
  await recomputeSubjectRating(review.subjectId);
  await recomputeMatchingWeights();
  await audit({ userId: staff.id, action: "review.hidden", entityType: "Review", entityId: reviewId });
  revalidatePath("/agent/reviews");
}

/** Staff restores a previously hidden review. */
export async function unhideReview(reviewId: string) {
  const staff = await requireAgent();
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: { status: "PUBLISHED", hiddenById: null, hiddenReason: null },
  });
  await recomputeSubjectRating(review.subjectId);
  await recomputeMatchingWeights();
  await audit({ userId: staff.id, action: "review.unhidden", entityType: "Review", entityId: reviewId });
  revalidatePath("/agent/reviews");
}
