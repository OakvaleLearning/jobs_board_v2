import type {
  EmploymentType,
  Currency,
  ReferralSource,
  DocumentType,
  ProfileStatus,
  CertStatus,
  VerificationStatus,
  JobStatus,
  ApplicationStatus,
  BackgroundCheckStatus,
  OfferStatus,
  ContractType,
  ContractStatus,
  PlacementStatus,
  WelfareMethod,
  WellbeingStatus,
  CpdStatus,
  ComplaintCategory,
  ComplaintUrgency,
  ComplaintStatus,
  ComplaintStage,
  InvoiceStatus,
  InvoiceType,
  AssessmentType,
  ReviewDirection,
  ReviewStatus,
} from "@/generated/prisma/client";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT - Abuja", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export const LANGUAGES = ["English", "Hausa", "Yoruba", "Igbo", "Pidgin"];

export const EXPERIENCE_LEVELS = ["Entry", "Intermediate", "Experienced"];

export const EMPLOYER_SECTORS = [ 
  "Childcare & Early Years",
  "Elderly & Disability Care"
];

export const employmentTypeLabels: Record<EmploymentType, string> = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  SHIFT: "Shift",
  LIVE_IN: "Live-in",
  CONTRACT: "Contract",
};

export const currencyLabels: Record<Currency, string> = {
  NGN: "₦ NGN",
  GBP: "£ GBP",
  USD: "$ USD",
};

export const currencySymbols: Record<Currency, string> = {
  NGN: "₦",
  GBP: "£",
  USD: "$",
};

export const referralSourceLabels: Record<ReferralSource, string> = {
  SOCIAL_MEDIA: "Social media",
  PERSONAL_REFERRAL: "Personal referral",
  SEARCH_ENGINE: "Search engine (Google, etc.)",
  EVENT: "An event or workshop",
  OTHER: "Other / None",
};

export const documentTypeLabels: Record<DocumentType, string> = {
  NIN: "National ID (NIN)",
  PASSPORT: "International Passport",
  VOTER_CARD: "Voter's Card",
  DRIVERS_LICENCE: "Driver's Licence",
  SELFIE: "Selfie / Liveness Photo",
  ADDRESS_PROOF: "Proof of Address",
  CERTIFICATE: "Oakvale Certificate",
  POLICE_REPORT: "Police Report",
  GUARANTOR_LETTER: "Guarantor Letter",
  AFFIDAVIT: "Affidavit of Good Conduct",
  VIDEO_INTRO: "Video Introduction",
};

type StatusMeta = { label: string; color: "default" | "success" | "warning" | "error" | "info" };

export const profileStatusMeta: Record<ProfileStatus, StatusMeta> = {
  DRAFT: { label: "Draft", color: "default" },
  PENDING: { label: "Pending review", color: "warning" },
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  SUSPENDED: { label: "Suspended", color: "error" },
};

export const certStatusMeta: Record<CertStatus, StatusMeta> = {
  NOT_SUBMITTED: { label: "Not submitted", color: "default" },
  PENDING: { label: "Awaiting review", color: "warning" },
  APPROVED: { label: "Verified", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
};

export const verificationStatusMeta: Record<VerificationStatus, StatusMeta> = {
  PENDING: { label: "Pending", color: "warning" },
  APPROVED: { label: "Approved", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
};

export const backgroundCheckMeta: Record<BackgroundCheckStatus, StatusMeta> = {
  NOT_REQUESTED: { label: "Not requested", color: "default" },
  PENDING: { label: "Pending", color: "warning" },
  IN_PROGRESS: { label: "In progress", color: "info" },
  CLEAR: { label: "Clear", color: "success" },
  FLAGGED: { label: "Flagged", color: "error" },
};

export const jobStatusMeta: Record<JobStatus, StatusMeta> = {
  DRAFT: { label: "Draft", color: "default" },
  PENDING_REVIEW: { label: "Pending review", color: "warning" },
  APPROVED: { label: "Live", color: "success" },
  REJECTED: { label: "Rejected", color: "error" },
  CLOSED: { label: "Closed", color: "default" },
};

export const applicationStatusMeta: Record<ApplicationStatus, StatusMeta> = {
  APPLIED: { label: "Applied", color: "info" },
  SHORTLISTED: { label: "Shortlisted", color: "info" },
  INTERVIEW: { label: "Interview", color: "warning" },
  OFFER: { label: "Offer made", color: "warning" },
  ACCEPTED: { label: "Accepted", color: "success" },
  DECLINED: { label: "Declined", color: "default" },
  REJECTED: { label: "Not progressing", color: "error" },
  HIRED: { label: "Hired", color: "success" },
};

export const offerStatusMeta: Record<OfferStatus, StatusMeta> = {
  PENDING_ADMIN: { label: "Awaiting Oakvale review", color: "warning" },
  SENT: { label: "Sent to worker", color: "info" },
  ACCEPTED: { label: "Accepted", color: "success" },
  DECLINED: { label: "Declined", color: "default" },
  NEGOTIATE: { label: "Negotiation requested", color: "warning" },
};

export function formatSalaryRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: Currency,
): string {
  const sym = currencySymbols[currency];
  const fmt = (n: number) => n.toLocaleString();
  if (min && max) return `${sym}${fmt(min)} – ${sym}${fmt(max)}`;
  if (min) return `From ${sym}${fmt(min)}`;
  if (max) return `Up to ${sym}${fmt(max)}`;
  return "Negotiable";
}

// Minimum profile completion before a worker can be listed as searchable.
export const SEARCHABLE_THRESHOLD = 70;

// ----------------------------------------------------------------------------
// Stage 2 — contracts, placement, welfare, CPD, complaints, billing
// ----------------------------------------------------------------------------

/** Standard replacement-guarantee window (days from placement start). */
export const GUARANTEE_DAYS = 90;
/** CPD refresh cycle default when a workforce category doesn't configure one. */
export const CPD_CYCLE_MONTHS_DEFAULT = 12;
/** Placement fee (NGN) charged per placement when the employer type has none set. */
export const DEFAULT_PLACEMENT_FEE_NGN = 150000;
/** Annual partnership subscription fee (NGN) when the employer type has none set. */
export const DEFAULT_SUBSCRIPTION_FEE_NGN = 500000;
/** CPD refresh fee (NGN) charged per placed worker per cycle when none is set. */
export const DEFAULT_CPD_REFRESH_FEE_NGN = 25000;

export const contractTypeLabels: Record<ContractType, string> = {
  WORKER_PLACEMENT: "Worker Placement Agreement",
  EMPLOYER_SERVICE: "Employer Service Agreement",
  ANNUAL_PARTNERSHIP: "Annual Partnership Agreement",
};

export const contractStatusMeta: Record<ContractStatus, StatusMeta> = {
  DRAFT: { label: "Draft", color: "default" },
  AWAITING_SIGNATURE: { label: "Awaiting signature", color: "warning" },
  EXECUTED: { label: "Fully executed", color: "success" },
  SUPERSEDED: { label: "Superseded", color: "default" },
  TERMINATED: { label: "Terminated", color: "default" },
  DISPUTED: { label: "Disputed", color: "error" },
};

export const placementStatusMeta: Record<PlacementStatus, StatusMeta> = {
  ACTIVE: { label: "Active", color: "success" },
  ENDED: { label: "Ended", color: "default" },
  SUSPENDED: { label: "Suspended", color: "error" },
  UNDER_REVIEW: { label: "Under review", color: "warning" },
};

export const welfareMethodLabels: Record<WelfareMethod, string> = {
  CALL: "Phone call",
  MESSAGE: "Message",
  VISIT: "In-person visit",
};

export const wellbeingMeta: Record<WellbeingStatus, StatusMeta> = {
  GREEN: { label: "Green — all well", color: "success" },
  AMBER: { label: "Amber — needs attention", color: "warning" },
  RED: { label: "Red — urgent", color: "error" },
};

export const cpdStatusMeta: Record<CpdStatus, StatusMeta> = {
  CURRENT: { label: "CPD current", color: "success" },
  DUE_SOON: { label: "CPD due soon", color: "warning" },
  OVERDUE: { label: "CPD overdue", color: "error" },
};

export const complaintCategoryLabels: Record<ComplaintCategory, string> = {
  WORKER_NON_ATTENDANCE: "Worker non-attendance",
  WORKER_UNDERPERFORMANCE: "Worker underperformance",
  WORKER_MISCONDUCT_MINOR: "Worker misconduct (minor)",
  WORKER_MISCONDUCT_SERIOUS: "Worker misconduct (serious / safeguarding)",
  EMPLOYER_UNFAIR_TREATMENT: "Employer unfair treatment",
  EMPLOYER_NON_PAYMENT: "Employer non-payment / payment dispute",
  PLATFORM_DISPUTE: "Platform dispute (contract terms)",
  DATA_PRIVACY: "Data privacy concern",
};

export const complaintUrgencyMeta: Record<ComplaintUrgency, StatusMeta> = {
  CRITICAL: { label: "Critical", color: "error" },
  HIGH: { label: "High", color: "warning" },
  STANDARD: { label: "Standard", color: "info" },
};

export const complaintStatusMeta: Record<ComplaintStatus, StatusMeta> = {
  SUBMITTED: { label: "Submitted", color: "info" },
  TRIAGED: { label: "Triaged", color: "info" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "info" },
  INVESTIGATING: { label: "Investigating", color: "warning" },
  RESOLVED: { label: "Resolved", color: "success" },
  CLOSED: { label: "Closed", color: "default" },
  REOPENED: { label: "Reopened", color: "warning" },
};

export const complaintStageLabels: Record<ComplaintStage, string> = {
  TRIAGE: "Triage",
  ACKNOWLEDGEMENT: "Acknowledgement",
  INVESTIGATION: "Investigation",
  RESOLUTION: "Resolution decision",
  COMMUNICATION: "Communication",
  CLOSURE: "Case closure",
};

export const invoiceTypeLabels: Record<InvoiceType, string> = {
  PLACEMENT_FEE: "Placement fee",
  SUBSCRIPTION: "Subscription",
  CPD_REFRESH: "CPD refresh fee",
};

export const invoiceStatusMeta: Record<InvoiceStatus, StatusMeta> = {
  ISSUED: { label: "Issued", color: "warning" },
  PAID: { label: "Paid", color: "success" },
  OVERDUE: { label: "Overdue", color: "error" },
  VOID: { label: "Void", color: "default" },
};

export const assessmentTypeLabels: Record<AssessmentType, string> = {
  CARE_NEEDS: "Care Needs Assessment",
  WORKFORCE_REQUIREMENTS: "Workforce Requirements",
};

/** Response-target SLA (hours) per complaint urgency (brief §9.1). */
export const COMPLAINT_SLA_HOURS: Record<ComplaintUrgency, number> = {
  CRITICAL: 2,
  HIGH: 24,
  STANDARD: 48,
};

/** Derives urgency from complaint category (brief §9.1). */
export function complaintUrgencyFor(category: ComplaintCategory): ComplaintUrgency {
  switch (category) {
    case "WORKER_MISCONDUCT_SERIOUS":
      return "CRITICAL";
    case "WORKER_NON_ATTENDANCE":
    case "EMPLOYER_NON_PAYMENT":
    case "DATA_PRIVACY":
      return "HIGH";
    default:
      return "STANDARD";
  }
}

export function formatMoney(amount: number, currency: Currency): string {
  return `${currencySymbols[currency]}${amount.toLocaleString()}`;
}

// ---------------------------------------------------------------------------
// Stage 3 — reviews & learned matching
// ---------------------------------------------------------------------------

export const reviewDirectionLabels: Record<ReviewDirection, string> = {
  EMPLOYER_ON_WORKER: "Employer review of worker",
  WORKER_ON_EMPLOYER: "Worker review of employer",
};

export const reviewStatusMeta: Record<ReviewStatus, StatusMeta> = {
  PUBLISHED: { label: "Published", color: "success" },
  HIDDEN: { label: "Hidden", color: "default" },
};

/** Minimum characters for a review comment. */
export const RATING_MIN_COMMENT = 20;

/** The matching factors that carry a tunable weight. */
export type MatchFactor =
  | "category"
  | "location"
  | "relocate"
  | "employmentType"
  | "availability"
  | "rating";

export type MatchWeights = Record<MatchFactor, number>;

/**
 * Admin-editable base weights (the transparent defaults). The original stage-2
 * heuristic used category 40 · location 25 · relocate 12 · employmentType 20 ·
 * availability 15; the rating factor is added here.
 */
export const DEFAULT_MATCH_WEIGHTS: MatchWeights = {
  category: 40,
  location: 25,
  relocate: 12,
  employmentType: 20,
  availability: 15,
  rating: 20,
};

export const matchFactorLabels: Record<MatchFactor, string> = {
  category: "Category match",
  location: "Same state",
  relocate: "Willing to relocate",
  employmentType: "Employment type",
  availability: "Availability",
  rating: "Worker rating",
};

/**
 * Prior strength for shrinking learned weights toward the admin defaults:
 * effective = (n/(n+K))·learned + (K/(n+K))·base. Larger K = more data needed
 * before the learned signal dominates.
 */
export const MATCH_WEIGHT_PRIOR_K = 20;

/** Neutral rating factor value (0–1) for workers with no reviews yet. */
export const RATING_NEUTRAL = 0.6;

export function formatRating(avg: number | null | undefined, count: number): string {
  if (!avg || count === 0) return "No reviews yet";
  return `${avg.toFixed(1)}★ (${count})`;
}

/**
 * Canonical ordering for care-type categories on the job-posting form. Care
 * types whose `category` matches (case-insensitive) appear under that heading,
 * in this order; anything else falls into a trailing "Other" group. The field
 * is admin-editable, so unknown categories are tolerated — they just sort last.
 */
export const CARE_CATEGORY_ORDER = [
  "Personal Care",
  "Specialized Care",
  "Companionship & Daily Living",
  "Health Monitoring",
  "Childcare",
] as const;
