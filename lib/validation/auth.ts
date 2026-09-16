import { z } from "zod";
import { currenciesFor } from "@/lib/plans";

export const referralSources = [
  "SOCIAL_MEDIA",
  "PERSONAL_REFERRAL",
  "SEARCH_ENGINE",
  "EVENT",
  "OTHER",
] as const;

export const accountTypes = ["LOCAL_NG", "DIASPORA_GLOBAL"] as const;
export const billingCurrencies = ["NGN", "USD", "GBP", "CAD"] as const;

export const signupSchema = z
  .object({
    role: z.enum(["WORKER", "EMPLOYER"]),
    // US-1.1 — employers declare their hiring context at signup; it decides
    // their billing currency, gateway and feature set.
    accountType: z.enum(accountTypes).optional(),
    currency: z.enum(billingCurrencies).optional(),
    countryCode: z.string().trim().length(2, "Select your country.").optional(),
    name: z.string().trim().min(2, "Please enter your full name."),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a valid phone number.")
      .max(20, "Enter a valid phone number."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[A-Za-z]/, "Include at least one letter.")
      .regex(/[0-9]/, "Include at least one number."),
    referralSource: z.enum(referralSources).optional(),
    referrerName: z.string().trim().max(120).optional(),
  })
  .refine(
    (data) =>
      data.referralSource !== "PERSONAL_REFERRAL" ||
      (data.referrerName && data.referrerName.length > 1),
    {
      message: "Please tell us who referred you.",
      path: ["referrerName"],
    },
  )
  .superRefine((data, ctx) => {
    if (data.role !== "EMPLOYER") return;

    if (!data.accountType) {
      ctx.addIssue({
        code: "custom",
        path: ["accountType"],
        message: "Tell us whether you are hiring locally or sponsoring from abroad.",
      });
      return;
    }

    // The currency must be one the chosen account type is billed in: local
    // accounts are NGN-only, diaspora accounts pick USD / GBP / CAD.
    const allowed: readonly string[] = currenciesFor[data.accountType];
    if (!data.currency || !allowed.includes(data.currency)) {
      ctx.addIssue({
        code: "custom",
        path: ["currency"],
        message:
          data.accountType === "LOCAL_NG"
            ? "Local accounts are billed in Naira."
            : "Choose the currency you want to be billed in.",
      });
    }

    if (data.accountType === "DIASPORA_GLOBAL" && !data.countryCode) {
      ctx.addIssue({
        code: "custom",
        path: ["countryCode"],
        message: "Select the country you are sponsoring from.",
      });
    }
  });

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
