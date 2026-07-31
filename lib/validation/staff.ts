import { z } from "zod";

// Admin-only staff provisioning. Mirrors the password policy in lib/validation/auth.ts
// so staff and public accounts share one rule set. Only ADMIN/AGENT can be created here;
// those roles need no related profile records (unlike WORKER/EMPLOYER).
export const createStaffSchema = z.object({
  role: z.enum(["ADMIN", "AGENT"]),
  name: z.string().trim().min(2, "Please enter a full name."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().max(20, "Enter a valid phone number.").optional().or(z.literal("")),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Include at least one letter.")
    .regex(/[0-9]/, "Include at least one number."),
});
