import { z } from "zod";

export const referralSources = [
  "SOCIAL_MEDIA",
  "PERSONAL_REFERRAL",
  "SEARCH_ENGINE",
  "EVENT",
  "OTHER",
] as const;

export const signupSchema = z
  .object({
    role: z.enum(["WORKER", "EMPLOYER"]),
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
  );

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
