import type {
  AccountType,
  Currency,
  PlanTier,
  PaymentProvider,
} from "@/generated/prisma/client";

/**
 * PRD §2 — the employer subscription architecture, in one place.
 *
 * Platform subscriptions and interview credits are Software Access &
 * Matchmaking Fees paid to Oakvale. They are deliberately decoupled from
 * caregiver salary negotiations and never appear on a placement contract.
 */

// ---------------------------------------------------------------------------
// Account types
// ---------------------------------------------------------------------------

export const accountTypeLabels: Record<AccountType, string> = {
  LOCAL_NG: "Local Employer (Nigeria)",
  DIASPORA_GLOBAL: "Diaspora Sponsor (Global)",
};

export const accountTypeDescriptions: Record<AccountType, string> = {
  LOCAL_NG: "I am hiring locally within Nigeria.",
  DIASPORA_GLOBAL: "I am sponsoring/managing care remotely from abroad.",
};

/** Currencies an account of this type may be billed in (first is the default). */
export const currenciesFor: Record<AccountType, Currency[]> = {
  LOCAL_NG: ["NGN"],
  DIASPORA_GLOBAL: ["USD", "GBP", "CAD"],
};

/** Gateways an account of this type checks out through, in preference order. */
export const providersFor: Record<AccountType, PaymentProvider[]> = {
  LOCAL_NG: ["PAYSTACK", "FLUTTERWAVE"],
  DIASPORA_GLOBAL: ["STRIPE", "PAYPAL"],
};

export const gatewayLabels: Record<AccountType, string> = {
  LOCAL_NG: "Paystack / Flutterwave (NGN)",
  DIASPORA_GLOBAL: "Stripe / PayPal (USD, GBP, CAD)",
};

export function defaultCurrencyFor(accountType: AccountType): Currency {
  return currenciesFor[accountType][0];
}

export function isCurrencyValidFor(accountType: AccountType, currency: Currency): boolean {
  return currenciesFor[accountType].includes(currency);
}

// ---------------------------------------------------------------------------
// Plans
// ---------------------------------------------------------------------------

export const planTierLabels: Record<PlanTier, string> = {
  STANDARD: "Standard",
  PREMIUM: "Premium Hire",
};

/** The capabilities a plan can unlock. Gating everywhere reads these. */
export type PlanFeatures = {
  /** Candidate directory reach. */
  diasporaReadyPool: boolean;
  /** US-2.1 — video intro + downloadable verification bundle. */
  enhancedVettingPack: boolean;
  /** US-4.1 — digital care logs & progress reports. */
  remoteCareOversight: boolean;
  /** Monthly virtual interview allowance. */
  interviewsPerMonth: number;
};

type PlanDefinition = {
  accountType: AccountType;
  tier: PlanTier;
  /** Monthly price keyed by billing currency. */
  price: Partial<Record<Currency, number>>;
  features: PlanFeatures;
};

/**
 * The plan matrix. Prices are whole currency units (₦20,000 / $25 / £20).
 *
 * Per the PRD's universal-credibility principle, candidate certification and
 * basic verification are identical across every tier — differentiation is
 * currency compatibility, remote oversight tooling and interview allowance.
 */
export const PLANS: PlanDefinition[] = [
  {
    accountType: "LOCAL_NG",
    tier: "STANDARD",
    price: { NGN: 20_000 },
    features: {
      diasporaReadyPool: false,
      enhancedVettingPack: false,
      remoteCareOversight: false,
      interviewsPerMonth: 1,
    },
  },
  {
    accountType: "LOCAL_NG",
    tier: "PREMIUM",
    price: { NGN: 45_000 },
    features: {
      diasporaReadyPool: false,
      enhancedVettingPack: false,
      remoteCareOversight: false,
      interviewsPerMonth: 5,
    },
  },
  {
    accountType: "DIASPORA_GLOBAL",
    tier: "STANDARD",
    price: { USD: 25, GBP: 20, CAD: 34 },
    features: {
      diasporaReadyPool: true,
      enhancedVettingPack: true,
      remoteCareOversight: true,
      interviewsPerMonth: 1,
    },
  },
  {
    accountType: "DIASPORA_GLOBAL",
    tier: "PREMIUM",
    price: { USD: 60, GBP: 50, CAD: 82 },
    features: {
      diasporaReadyPool: true,
      enhancedVettingPack: true,
      remoteCareOversight: true,
      interviewsPerMonth: 5,
    },
  },
];

export function planFor(accountType: AccountType, tier: PlanTier): PlanDefinition {
  const plan = PLANS.find((p) => p.accountType === accountType && p.tier === tier);
  if (!plan) throw new Error(`No plan defined for ${accountType}/${tier}`);
  return plan;
}

export function plansFor(accountType: AccountType): PlanDefinition[] {
  return PLANS.filter((p) => p.accountType === accountType);
}

/** Monthly price for a plan in the account's billing currency. */
export function planPrice(accountType: AccountType, tier: PlanTier, currency: Currency): number {
  const price = planFor(accountType, tier).price[currency];
  if (price === undefined) {
    throw new Error(`Plan ${accountType}/${tier} is not priced in ${currency}.`);
  }
  return price;
}

/** The feature set an employer actually has, given their plan (none = locked). */
export function featuresFor(
  accountType: AccountType,
  tier: PlanTier | null | undefined,
): PlanFeatures {
  if (!tier) {
    return {
      diasporaReadyPool: false,
      enhancedVettingPack: false,
      remoteCareOversight: false,
      interviewsPerMonth: 0,
    };
  }
  return planFor(accountType, tier).features;
}

// ---------------------------------------------------------------------------
// Add-on interview credits
// ---------------------------------------------------------------------------

/** Price of one standalone interview credit, by billing currency. */
export const CREDIT_PRICE: Record<Currency, number> = {
  NGN: 5_000,
  USD: 7,
  GBP: 5,
  CAD: 10,
};

export function creditPrice(currency: Currency): number {
  return CREDIT_PRICE[currency];
}
