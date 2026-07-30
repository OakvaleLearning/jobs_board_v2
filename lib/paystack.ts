import crypto from "node:crypto";

const SECRET = process.env.PAYSTACK_SECRET_KEY || "";
const BASE = "https://api.paystack.co";

export function paystackConfigured(): boolean {
  return SECRET.startsWith("sk_");
}

function appUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `${base}${path}`;
}

/**
 * Initialises a Paystack transaction and returns the hosted checkout URL.
 * Amounts are in the smallest currency unit (kobo for NGN).
 */
export async function initializeTransaction(opts: {
  email: string;
  amountNaira: number;
  reference: string;
  callbackPath: string;
  metadata?: Record<string, unknown>;
}): Promise<{ authorizationUrl: string; reference: string }> {
  const res = await fetch(`${BASE}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SECRET}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: opts.email,
      amount: opts.amountNaira * 100,
      currency: "NGN",
      reference: opts.reference,
      callback_url: appUrl(opts.callbackPath),
      metadata: opts.metadata,
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Failed to initialise payment.");
  }
  return { authorizationUrl: json.data.authorization_url, reference: json.data.reference };
}

/** Verifies a transaction by reference. Returns true when successfully paid. */
export async function verifyTransaction(reference: string): Promise<boolean> {
  const res = await fetch(`${BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${SECRET}` },
  });
  const json = await res.json();
  return Boolean(res.ok && json.status && json.data?.status === "success");
}

/** Validates a Paystack webhook signature (x-paystack-signature header). */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  if (!signature || !SECRET) return false;
  const hash = crypto.createHmac("sha512", SECRET).update(rawBody).digest("hex");
  return hash === signature;
}
