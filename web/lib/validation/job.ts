import { z } from "zod";

export const jobSchema = z
  .object({
    title: z.string().trim().min(4, "Enter a clear job title."),
    workforceCategoryId: z.string().min(1, "Select the workforce category."),
    careTypeIds: z.array(z.string()).min(1, "Select at least one care type."),
    description: z.string().trim().min(40, "Describe the role in at least 40 characters."),
    state: z.string().trim().optional(),
    lga: z.string().trim().optional(),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"]),
    salaryMin: z.coerce.number().int().positive().optional(),
    salaryMax: z.coerce.number().int().positive().optional(),
    salaryCurrency: z.enum(["NGN", "GBP", "USD"]),
    backgroundCheckRequired: z.boolean(),
    visibility: z.enum(["PUBLIC", "RESTRICTED"]),
  })
  .refine(
    (d) => !d.salaryMin || !d.salaryMax || d.salaryMax >= d.salaryMin,
    { message: "Maximum salary must be at least the minimum.", path: ["salaryMax"] },
  );

export type JobInput = z.infer<typeof jobSchema>;
