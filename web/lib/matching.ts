import { prisma } from "@/lib/prisma";
import {
  DEFAULT_MATCH_WEIGHTS,
  MATCH_WEIGHT_PRIOR_K,
  RATING_NEUTRAL,
  type MatchWeights,
  type MatchFactor,
} from "@/lib/constants";
import type { EmploymentType } from "@/generated/prisma/client";

export type MatchCriteria = {
  workforceCategoryId?: string | null;
  state?: string | null;
  employmentType?: EmploymentType | null;
};

export type ScoredWorker = {
  workerId: string;
  name: string;
  score: number;
  reasons: string[];
  state: string | null;
  categoryName: string | null;
  experienceLevel: string | null;
  ratingAvg: number | null;
  ratingCount: number;
};

// ---------------------------------------------------------------------------
// Weights source (admin base + outcome-learned effective weights)
// ---------------------------------------------------------------------------

function coerceWeights(value: unknown): MatchWeights | null {
  if (!value || typeof value !== "object") return null;
  const v = value as Record<string, unknown>;
  const out = {} as MatchWeights;
  for (const key of Object.keys(DEFAULT_MATCH_WEIGHTS) as MatchFactor[]) {
    const n = v[key];
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0) return null;
    out[key] = n;
  }
  return out;
}

export type MatchingModelView = {
  baseWeights: MatchWeights;
  learnedWeights: MatchWeights | null;
  effectiveWeights: MatchWeights;
  sampleSize: number;
  lastLearnedAt: Date | null;
};

/** Loads the singleton matching model, falling back to code defaults. */
export async function getMatchingModel(): Promise<MatchingModelView> {
  const row = await prisma.matchingModel.findUnique({ where: { id: "default" } });
  const baseWeights = coerceWeights(row?.baseWeights) ?? DEFAULT_MATCH_WEIGHTS;
  const learnedWeights = row ? coerceWeights(row.learnedWeights) : null;
  return {
    baseWeights,
    learnedWeights,
    effectiveWeights: learnedWeights ?? baseWeights,
    sampleSize: row?.sampleSize ?? 0,
    lastLearnedAt: row?.lastLearnedAt ?? null,
  };
}

/** The weights the ranker should use right now (learned if present, else base). */
export async function getMatchingWeights(): Promise<MatchWeights> {
  return (await getMatchingModel()).effectiveWeights;
}

// ---------------------------------------------------------------------------
// Ranking
// ---------------------------------------------------------------------------

/**
 * Ranks searchable, approved workers against a role spec with a transparent,
 * explainable score. Weights come from the admin-managed / outcome-learned
 * matching model; the rating factor rewards well-reviewed workers. Scores are
 * normalised to 0–100 against the weights that actually apply to this role.
 */
export async function rankWorkers(criteria: MatchCriteria, limit = 20): Promise<ScoredWorker[]> {
  const weights = await getMatchingWeights();
  const workers = await prisma.workerProfile.findMany({
    where: { searchable: true, profileStatus: "APPROVED", deletedAt: null },
    include: { user: { select: { name: true } }, workforceCategory: { select: { name: true } } },
    take: 100,
  });

  const now = new Date();

  // Denominator: the maximum score attainable for THIS role, so % is comparable.
  const locationMax = criteria.state
    ? Math.max(weights.location, weights.relocate)
    : weights.relocate;
  const denom =
    (criteria.workforceCategoryId ? weights.category : 0) +
    locationMax +
    (criteria.employmentType ? weights.employmentType : 0) +
    weights.availability +
    weights.rating;

  const scored = workers.map((w): ScoredWorker => {
    let raw = 0;
    const reasons: string[] = [];

    if (criteria.workforceCategoryId && w.workforceCategoryId === criteria.workforceCategoryId) {
      raw += weights.category;
      reasons.push("Category match");
    }
    if (criteria.state && w.state && w.state === criteria.state) {
      raw += weights.location;
      reasons.push("Same state");
    } else if (w.willingToRelocate) {
      raw += weights.relocate;
      reasons.push("Willing to relocate");
    }
    if (criteria.employmentType && w.employmentTypes.includes(criteria.employmentType)) {
      raw += weights.employmentType;
      reasons.push("Employment type match");
    }
    if (!w.availabilityDate || w.availabilityDate <= now) {
      raw += weights.availability;
      reasons.push("Available now");
    }

    // Rating factor — normalised 0–1, neutral for unrated workers so newcomers
    // are not buried before they have a track record.
    const ratingValue = w.ratingCount > 0 && w.ratingAvg != null ? w.ratingAvg / 5 : RATING_NEUTRAL;
    raw += weights.rating * ratingValue;
    if (w.ratingCount > 0 && w.ratingAvg != null) {
      reasons.push(`Rated ${w.ratingAvg.toFixed(1)}★ (${w.ratingCount})`);
    }

    const score = denom > 0 ? Math.round((raw / denom) * 100) : 0;

    return {
      workerId: w.id,
      name: w.user.name,
      score,
      reasons,
      state: w.state,
      categoryName: w.workforceCategory?.name ?? null,
      experienceLevel: w.experienceLevel,
      ratingAvg: w.ratingAvg,
      ratingCount: w.ratingCount,
    };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

// ---------------------------------------------------------------------------
// Outcome-learned weighting
// ---------------------------------------------------------------------------

/**
 * Recomputes the matching weights from historical placement outcomes and
 * persists them to the singleton MatchingModel row. Fully transparent:
 *
 *  1. Each terminal placement is labelled success/failure.
 *  2. For each factor, lift = successRate(factor present) − baseline, floored at 0.
 *  3. Lifts are normalised to the admin base-weight budget.
 *  4. Learned weights are shrunk toward the admin defaults by sample size, so
 *     the system falls back to the defaults when data is sparse.
 *
 * Called post-commit whenever an outcome-affecting event occurs (a new review,
 * a placement ending, a replacement request, or a resolved complaint).
 */
export async function recomputeMatchingWeights(): Promise<MatchingModelView> {
  const base =
    coerceWeights((await prisma.matchingModel.findUnique({ where: { id: "default" } }))?.baseWeights) ??
    DEFAULT_MATCH_WEIGHTS;

  const placements = await prisma.placement.findMany({
    where: {
      OR: [{ status: "ENDED" }, { replacedBy: { isNot: null } }, { complaints: { some: {} } }],
    },
    include: {
      job: { select: { workforceCategoryId: true, state: true, employmentType: true } },
      worker: {
        select: {
          workforceCategoryId: true,
          state: true,
          willingToRelocate: true,
          employmentTypes: true,
          availabilityDate: true,
          ratingAvg: true,
          ratingCount: true,
        },
      },
      complaints: { select: { category: true, status: true } },
      reviews: { select: { direction: true, rating: true } },
      replacedBy: { select: { id: true } },
    },
  });

  const factors = Object.keys(base) as MatchFactor[];
  const n = placements.length;

  if (n === 0) {
    return persistWeights(base, null, 0);
  }

  const now = new Date();
  let totalSuccess = 0;
  const presentCount: Record<MatchFactor, number> = blankTally(factors);
  const presentSuccess: Record<MatchFactor, number> = blankTally(factors);

  for (const p of placements) {
    const workerReview = p.reviews.find((r) => r.direction === "EMPLOYER_ON_WORKER");
    const wasReplaced = p.replacedBy != null; // a replacement means the placement failed
    const workerFaultComplaint = p.complaints.some(
      (c) => c.category.startsWith("WORKER_") && (c.status === "RESOLVED" || c.status === "CLOSED"),
    );
    const isFailure =
      wasReplaced || workerFaultComplaint || (workerReview != null && workerReview.rating <= 2);
    const success = !isFailure;
    if (success) totalSuccess += 1;

    const present: Record<MatchFactor, boolean> = {
      category: p.worker.workforceCategoryId != null && p.worker.workforceCategoryId === p.job.workforceCategoryId,
      location: p.worker.state != null && p.worker.state === p.job.state,
      relocate: p.worker.willingToRelocate,
      employmentType:
        p.job.employmentType != null && p.worker.employmentTypes.includes(p.job.employmentType),
      availability: p.worker.availabilityDate == null || p.worker.availabilityDate <= now,
      rating: p.worker.ratingCount > 0 && p.worker.ratingAvg != null && p.worker.ratingAvg >= 4,
    };
    for (const f of factors) {
      if (present[f]) {
        presentCount[f] += 1;
        if (success) presentSuccess[f] += 1;
      }
    }
  }

  const baseline = totalSuccess / n;
  const budget = factors.reduce((sum, f) => sum + base[f], 0);

  const lift: Record<MatchFactor, number> = blankTally(factors);
  let liftTotal = 0;
  for (const f of factors) {
    if (presentCount[f] > 0) {
      const rate = presentSuccess[f] / presentCount[f];
      lift[f] = Math.max(0, rate - baseline);
      liftTotal += lift[f];
    }
  }

  // Normalise lifts to the base budget; if no signal, learned == base.
  const learnedRaw: Record<MatchFactor, number> = blankTally(factors);
  for (const f of factors) {
    learnedRaw[f] = liftTotal > 0 ? (lift[f] / liftTotal) * budget : base[f];
  }

  // Shrink toward base by sample size (Bayesian prior of strength K).
  const k = MATCH_WEIGHT_PRIOR_K;
  const learned = {} as MatchWeights;
  for (const f of factors) {
    const eff = (n / (n + k)) * learnedRaw[f] + (k / (n + k)) * base[f];
    learned[f] = Math.round(eff * 10) / 10;
  }

  return persistWeights(base, learned, n);
}

function blankTally(factors: MatchFactor[]): Record<MatchFactor, number> {
  return Object.fromEntries(factors.map((f) => [f, 0])) as Record<MatchFactor, number>;
}

async function persistWeights(
  base: MatchWeights,
  learned: MatchWeights | null,
  sampleSize: number,
): Promise<MatchingModelView> {
  await prisma.matchingModel.upsert({
    where: { id: "default" },
    update: { learnedWeights: learned ?? undefined, sampleSize, lastLearnedAt: new Date() },
    create: {
      id: "default",
      baseWeights: base,
      learnedWeights: learned ?? undefined,
      sampleSize,
      lastLearnedAt: new Date(),
    },
  });
  return {
    baseWeights: base,
    learnedWeights: learned,
    effectiveWeights: learned ?? base,
    sampleSize,
    lastLearnedAt: new Date(),
  };
}
