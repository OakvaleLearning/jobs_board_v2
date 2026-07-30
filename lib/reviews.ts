import { prisma } from "@/lib/prisma";
import type { Placement, ReviewDirection } from "@/generated/prisma/client";

type ReviewablePlacement = Pick<
  Placement,
  "status" | "guaranteeWindowEnds" | "workerId" | "employerId"
> & {
  worker: { userId: string };
  employer: { userId: string };
};

/**
 * Determines whether `userId` (with `role`) may review the other party on this
 * placement, and in which direction. A placement is reviewable once it has
 * ENDED, or while ACTIVE but past its guarantee window (long-running roles).
 * Returns the allowed direction, or null if the caller cannot review.
 */
export function canReview(
  placement: ReviewablePlacement,
  userId: string,
  role: string,
  now = new Date(),
): ReviewDirection | null {
  const windowPassed =
    placement.guaranteeWindowEnds != null &&
    new Date(placement.guaranteeWindowEnds).getTime() <= now.getTime();
  const eligible = placement.status === "ENDED" || (placement.status === "ACTIVE" && windowPassed);
  if (!eligible) return null;

  if (role === "EMPLOYER" && placement.employer.userId === userId) return "EMPLOYER_ON_WORKER";
  if (role === "WORKER" && placement.worker.userId === userId) return "WORKER_ON_EMPLOYER";
  return null;
}

/**
 * Recomputes the cached ratingAvg/ratingCount on a subject's worker or employer
 * profile from their PUBLISHED reviews. Mirrors the cache-refresh style of
 * recomputeWorkerCompletion in lib/worker.ts.
 */
export async function recomputeSubjectRating(subjectUserId: string): Promise<void> {
  const agg = await prisma.review.aggregate({
    where: { subjectId: subjectUserId, status: "PUBLISHED" },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const ratingAvg = agg._avg.rating ?? null;
  const ratingCount = agg._count.rating;

  const user = await prisma.user.findUnique({
    where: { id: subjectUserId },
    select: { role: true },
  });
  if (!user) return;

  if (user.role === "WORKER") {
    await prisma.workerProfile.updateMany({
      where: { userId: subjectUserId },
      data: { ratingAvg, ratingCount },
    });
  } else if (user.role === "EMPLOYER") {
    await prisma.employerProfile.updateMany({
      where: { userId: subjectUserId },
      data: { ratingAvg, ratingCount },
    });
  }
}

const publishedReviewInclude = {
  author: { select: { name: true, role: true } },
  placement: { select: { roleTitle: true } },
} as const;

/** Published reviews written about a worker (visible to prospective employers + staff). */
export async function visibleReviewsForWorker(workerUserId: string) {
  return prisma.review.findMany({
    where: { subjectId: workerUserId, status: "PUBLISHED", direction: "EMPLOYER_ON_WORKER" },
    include: publishedReviewInclude,
    orderBy: { createdAt: "desc" },
  });
}

/** Published reviews written about an employer (visible to prospective workers + staff). */
export async function visibleReviewsForEmployer(employerUserId: string) {
  return prisma.review.findMany({
    where: { subjectId: employerUserId, status: "PUBLISHED", direction: "WORKER_ON_EMPLOYER" },
    include: publishedReviewInclude,
    orderBy: { createdAt: "desc" },
  });
}
