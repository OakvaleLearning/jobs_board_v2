import type { AccountType, Currency, PaymentProvider } from "@/generated/prisma/client";
import { providersFor } from "@/lib/plans";
import {
  paystackConfigured,
  initializeTransaction,
  verifyTransaction,
} from "@/lib/paystack";

/**
 * Provider-agnostic checkout.
 *
 * PRD §2 routes NGN accounts to the Nigerian rails (Paystack / Flutterwave) and
 * diaspora accounts to the FX rails (Stripe / PayPal). Everything above this
 * module deals only in `PaymentGateway`, so adding a real Stripe or PayPal
 * adapter is a matter of implementing this interface and registering it below —
 * no domain logic changes.
 */

export type CheckoutRequest = {
  email: string;
  /** Whole currency units (₦20,000 / $25) — adapters convert to minor units. */
  amount: number;
  currency: Currency;
  reference: string;
  callbackPath: string;
  description: string;
  metadata?: Record<string, unknown>;
};

export type CheckoutResult =
  /** Redirect the employer to a hosted checkout page. */
  | { kind: "redirect"; url: string }
  /** No live credentials: the charge is treated as settled immediately. */
  | { kind: "simulated" };

export interface PaymentGateway {
  provider: PaymentProvider;
  /** True when live credentials are present; false runs in simulation mode. */
  isLive(): boolean;
  supports(currency: Currency): boolean;
  checkout(req: CheckoutRequest): Promise<CheckoutResult>;
  /** Confirms a reference settled. Simulated gateways always confirm. */
  verify(reference: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// Paystack (NGN) — live
// ---------------------------------------------------------------------------

const paystackGateway: PaymentGateway = {
  provider: "PAYSTACK",
  isLive: () => paystackConfigured(),
  supports: (currency) => currency === "NGN",
  async checkout(req) {
    if (!paystackConfigured()) return { kind: "simulated" };
    const { authorizationUrl } = await initializeTransaction({
      email: req.email,
      amountNaira: req.amount,
      reference: req.reference,
      callbackPath: req.callbackPath,
      metadata: { description: req.description, ...req.metadata },
    });
    return { kind: "redirect", url: authorizationUrl };
  },
  verify: (reference) => verifyTransaction(reference),
};

// ---------------------------------------------------------------------------
// FX rails — simulation stand-ins
// ---------------------------------------------------------------------------

/**
 * Placeholder for a gateway whose SDK isn't wired up yet. It keeps the full
 * billing flow exercisable (plan activates, credits land, invoice marks paid)
 * while making it obvious in the UI that no money moved.
 *
 * To go live: replace `checkout` with a Checkout Session / Order creation that
 * returns the hosted URL, and `verify` with a session/order lookup. Nothing
 * else in the app needs to change.
 */
function simulatedGateway(
  provider: PaymentProvider,
  currencies: Currency[],
): PaymentGateway {
  return {
    provider,
    isLive: () => false,
    supports: (currency) => currencies.includes(currency),
    async checkout() {
      return { kind: "simulated" };
    },
    async verify() {
      return true;
    },
  };
}

const GATEWAYS: Record<PaymentProvider, PaymentGateway> = {
  PAYSTACK: paystackGateway,
  FLUTTERWAVE: simulatedGateway("FLUTTERWAVE", ["NGN"]),
  STRIPE: simulatedGateway("STRIPE", ["USD", "GBP", "CAD"]),
  PAYPAL: simulatedGateway("PAYPAL", ["USD", "GBP", "CAD"]),
};

/**
 * The gateway an account checks out through: the first provider configured for
 * its account type that supports its billing currency. Live providers win over
 * simulated ones so a configured Paystack is always preferred for NGN.
 */
export function gatewayFor(accountType: AccountType, currency: Currency): PaymentGateway {
  const candidates = providersFor[accountType]
    .map((p) => GATEWAYS[p])
    .filter((g) => g.supports(currency));
  if (candidates.length === 0) {
    throw new Error(`No payment gateway handles ${currency} for ${accountType} accounts.`);
  }
  return candidates.find((g) => g.isLive()) ?? candidates[0];
}

/** Looks a gateway up by provider — used when verifying a stored reference. */
export function gatewayByProvider(provider: PaymentProvider): PaymentGateway {
  return GATEWAYS[provider];
}
