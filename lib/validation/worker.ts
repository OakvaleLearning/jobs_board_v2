import { z } from "zod";

export const personalSchema = z.object({
  dateOfBirth: z.string().min(1, "Enter your date of birth."),
  gender: z.string().min(1, "Select your gender."),
  state: z.string().min(1, "Select your state."),
  lga: z.string().trim().min(2, "Enter your LGA."),
  address: z.string().trim().min(5, "Enter your home address."),
});

export const preferencesSchema = z.object({
  workforceCategoryId: z.string().min(1, "Select the type of work you do."),
  employmentTypes: z.array(z.enum(["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"])).min(1, "Select at least one work arrangement."),
  languages: z.array(z.string()).min(1, "Select at least one language."),
  willingToRelocate: z.boolean(),
  availabilityDate: z.string().optional(),
  experienceLevel: z.string().min(1, "Select your experience level."),
  expectedSalaryMin: z.coerce.number().int().positive("Enter your minimum expected salary."),
  expectedSalaryMax: z.coerce.number().int().positive().optional(),
  salaryCurrency: z.enum(["NGN", "GBP", "USD"]),
  personalStatement: z
    .string()
    .trim()
    .min(30, "Write at least 30 characters about yourself.")
    .max(2000),
});

export const educationSchema = z.object({
  institution: z.string().trim().min(2, "Enter the school or institution name."),
  qualification: z.string().trim().min(2, "Enter the qualification."),
  startYear: z.coerce.number().int().min(1950).max(2100).optional(),
  endYear: z.coerce.number().int().min(1950).max(2100).optional(),
});

export const experienceSchema = z.object({
  employer: z.string().trim().min(2, "Enter the employer's name."),
  roleTitle: z.string().trim().min(2, "Enter your role."),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().trim().max(1000).optional(),
});

export const certificateDetailsSchema = z.object({
  // Certificate number is OPTIONAL (per client decision) — upload is the artifact.
  certificateNumber: z.string().trim().max(60).optional(),
  certProgramme: z.string().trim().max(120).optional(),
  certCompletionDate: z.string().optional(),
});
