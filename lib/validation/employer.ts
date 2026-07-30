import { z } from "zod";

export const employerOnboardingSchema = z
  .object({
    kind: z.enum(["INDIVIDUAL", "ORGANIZATION"]),
    contactName: z.string().trim().min(2, "Enter a contact name."),
    country: z.string().trim().min(2, "Enter your country."),
    address: z.string().trim().min(5, "Enter your address."),
    // Organization-only
    orgName: z.string().trim().optional(),
    sector: z.string().trim().optional(),
    cacNumber: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.kind === "ORGANIZATION") {
      if (!data.orgName || data.orgName.length < 2) {
        ctx.addIssue({ code: "custom", path: ["orgName"], message: "Enter your organization name." });
      }
      if (!data.sector || data.sector.length < 2) {
        ctx.addIssue({ code: "custom", path: ["sector"], message: "Enter your sector." });
      }
      if (!data.cacNumber || !/^(RC)?\d{5,}$/i.test(data.cacNumber.replace(/\s/g, ""))) {
        ctx.addIssue({
          code: "custom",
          path: ["cacNumber"],
          message: "Enter a valid CAC number (e.g. RC1234567).",
        });
      }
    }
  });

export type EmployerOnboardingInput = z.infer<typeof employerOnboardingSchema>;
