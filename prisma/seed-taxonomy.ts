import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Populates ONLY the admin-configurable taxonomy tables (WorkforceCategory,
// EmployerType, CareType) — no demo users/jobs/placements. The data mirrors the
// taxonomy section of prisma/seed.ts exactly. Idempotent (upsert by slug), so it
// is safe to run against production and safe to re-run.
async function main() {
  console.log("Populating Oakvale taxonomies…");

  // --- Workforce categories (configurable taxonomy) ---
  await prisma.workforceCategory.upsert({
    where: { slug: "certified-caregiver" },
    update: {},
    create: {
      name: "Certified Caregiver (Elderly / Home Care)",
      slug: "certified-caregiver",
      description:
        "Trained in elderly care, medication management, dementia care, and post-surgical support. Holds Oakvale Caregiver certification.",
      config: {
        requiredCertification: "Oakvale Caregiver Certification",
        placementSettings: ["home", "care_home", "private_household"],
        employmentTypes: ["FULL_TIME", "PART_TIME", "LIVE_IN", "SHIFT"],
        cpdCycleMonths: 12,
      },
    },
  });

  await prisma.workforceCategory.upsert({
    where: { slug: "certified-childcare" },
    update: {},
    create: {
      name: "Certified Childcare Worker (Early Years)",
      slug: "certified-childcare",
      description:
        "Trained in early years development, child safeguarding, infant care, and SEND awareness. Holds Oakvale Childcare Programme certification.",
      config: {
        requiredCertification: "Oakvale Childcare Programme",
        placementSettings: ["creche", "nursery", "private_household"],
        employmentTypes: ["FULL_TIME", "PART_TIME", "SHIFT"],
        cpdCycleMonths: 12,
      },
    },
  });

  // --- Employer types (configurable taxonomy) ---
  await prisma.employerType.upsert({
    where: { slug: "individual-family" },
    update: {},
    create: {
      name: "Individual / Family",
      slug: "individual-family",
      kind: "INDIVIDUAL",
      description:
        "An individual or family hiring a carer for an elderly or dependent relative. Includes diaspora families based in the UK/US.",
      verificationMethod: "Proof of residence + ID",
      serviceModel: "account-managed",
      jobPostingEnabled: true,
      config: { placementFee: 200000 },
    },
  });

  await prisma.employerType.upsert({
    where: { slug: "organization-corporate" },
    update: {},
    create: {
      name: "Organization / Corporate",
      slug: "organization-corporate",
      kind: "ORGANIZATION",
      description:
        "A registered company or institution — e.g. a corporate crèche — hiring certified staff. Verified via CAC.",
      verificationMethod: "CAC registration number + document",
      serviceModel: "self-service",
      jobPostingEnabled: true,
      config: { placementFee: 150000 },
    },
  });

  // --- Care types (employer-side specialization; grouped into categories) ---
  // Overlapping items reuse their existing slug so any existing job links stay
  // valid; the broad "elderly-care" option is retired in favour of the granular
  // Personal/Specialized/etc. breakdown (kept as active:false, not deleted).
  const careTypes: {
    name: string;
    slug: string;
    category: string | null;
    active?: boolean;
  }[] = [
    // Personal Care
    { name: "Bathing & Hygiene", slug: "bathing-hygiene", category: "Personal Care" },
    { name: "Dressing", slug: "dressing", category: "Personal Care" },
    { name: "Mobility / Transfer Assistance", slug: "mobility-transfer", category: "Personal Care" },
    { name: "Toileting", slug: "toileting", category: "Personal Care" },
    // Specialized Care
    { name: "Dementia & Alzheimer's Care", slug: "dementia-support", category: "Specialized Care" },
    { name: "Diabetic Care", slug: "diabetic-care", category: "Specialized Care" },
    { name: "Post-Surgical / Rehab", slug: "post-surgical-care", category: "Specialized Care" },
    { name: "Parkinson's Care", slug: "parkinsons-care", category: "Specialized Care" },
    { name: "Hospice Support", slug: "palliative-care", category: "Specialized Care" },
    // Companionship & Daily Living
    { name: "Companionship", slug: "companionship", category: "Companionship & Daily Living" },
    { name: "Light Housekeeping", slug: "light-housekeeping", category: "Companionship & Daily Living" },
    { name: "Meal Preparation", slug: "meal-preparation", category: "Companionship & Daily Living" },
    { name: "Transportation / Errands", slug: "transportation-errands", category: "Companionship & Daily Living" },
    { name: "Live-in Domestic Support", slug: "live-in-support", category: "Companionship & Daily Living" },
    // Health Monitoring
    { name: "Medication Reminders", slug: "medication-reminders", category: "Health Monitoring" },
    { name: "Vital Sign Monitoring", slug: "vital-signs", category: "Health Monitoring" },
    { name: "Coordination with Doctors / Nurses", slug: "care-coordination", category: "Health Monitoring" },
    // Childcare (retained from the original taxonomy)
    { name: "Infant Care (0–12 months)", slug: "infant-care", category: "Childcare" },
    { name: "Toddler Care (1–3 years)", slug: "toddler-care", category: "Childcare" },
    { name: "Early Years (3–5 years)", slug: "early-years", category: "Childcare" },
    { name: "Special Educational Needs (SEND)", slug: "send-awareness", category: "Childcare" },
    // Retired broad option (superseded by the granular categories above)
    { name: "Elderly / Geriatric Care", slug: "elderly-care", category: "Personal Care", active: false },
  ];
  for (const { name, slug, category, active = true } of careTypes) {
    await prisma.careType.upsert({
      where: { slug },
      update: { name, category, active },
      create: { name, slug, category, active },
    });
  }

  const [workforce, employers, care] = await Promise.all([
    prisma.workforceCategory.count(),
    prisma.employerType.count(),
    prisma.careType.count(),
  ]);
  console.log("Taxonomies populated:", { workforceCategories: workforce, employerTypes: employers, careTypes: care });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
