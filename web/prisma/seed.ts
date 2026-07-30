import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { recomputeSubjectRating } from "../lib/reviews";
import { recomputeMatchingWeights } from "../lib/matching";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Oakvale Jobs Board…");

  // --- Workforce categories (configurable taxonomy) ---
  const caregiver = await prisma.workforceCategory.upsert({
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

  const childcare = await prisma.workforceCategory.upsert({
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

  // --- Sample users (password: Password123! for all) ---
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@oakvale.test" },
    update: {},
    create: {
      email: "admin@oakvale.test",
      passwordHash,
      role: "ADMIN",
      name: "Ada Admin",
      phone: "+2348010000001",
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agent@oakvale.test" },
    update: {},
    create: {
      email: "agent@oakvale.test",
      passwordHash,
      role: "AGENT",
      name: "Emeka Agent",
      phone: "+2348010000002",
    },
  });

  // Sample worker with an in-progress profile
  const workerUser = await prisma.user.upsert({
    where: { email: "worker@oakvale.test" },
    update: {},
    create: {
      email: "worker@oakvale.test",
      passwordHash,
      role: "WORKER",
      name: "Amina Bello",
      phone: "+2348020000001",
      referralSource: "PERSONAL_REFERRAL",
      referrerName: "Chidinma Okonkwo",
      workerProfile: {
        create: {
          state: "Lagos",
          lga: "Ikeja",
          gender: "Female",
          workforceCategoryId: caregiver.id,
          employmentTypes: ["FULL_TIME", "LIVE_IN"],
          languages: ["English", "Hausa", "Yoruba"],
          willingToRelocate: true,
          experienceLevel: "Experienced",
          expectedSalaryMin: 150000,
          expectedSalaryMax: 250000,
          salaryCurrency: "NGN",
          personalStatement:
            "Compassionate, Oakvale-certified caregiver with 6 years of elderly home-care experience.",
          completionPercent: 55,
          profileStatus: "DRAFT",
          certStatus: "NOT_SUBMITTED",
        },
      },
    },
  });

  // Sample individual employer (verified)
  await prisma.user.upsert({
    where: { email: "family@oakvale.test" },
    update: {},
    create: {
      email: "family@oakvale.test",
      passwordHash,
      role: "EMPLOYER",
      name: "Tunde Familyman",
      phone: "+447700900001",
      employerProfile: {
        create: {
          kind: "INDIVIDUAL",
          contactName: "Tunde Familyman",
          country: "United Kingdom",
          address: "12 Diaspora Lane, London",
          verificationStatus: "APPROVED",
        },
      },
    },
  });

  // Sample organization employer (verified)
  await prisma.user.upsert({
    where: { email: "corp@oakvale.test" },
    update: {},
    create: {
      email: "corp@oakvale.test",
      passwordHash,
      role: "EMPLOYER",
      name: "HR at BrightStart Ltd",
      phone: "+2348030000001",
      employerProfile: {
        create: {
          kind: "ORGANIZATION",
          orgName: "BrightStart Ltd",
          sector: "Financial Services",
          cacNumber: "RC1234567",
          contactName: "Ngozi HR",
          address: "5 Corporate Ave, Victoria Island, Lagos",
          country: "Nigeria",
          verificationStatus: "APPROVED",
        },
      },
    },
  });

  // --- Demo scenario: a ready-to-hire worker, a live job, and an application ---
  const demoWorker = await prisma.workerProfile.findUnique({ where: { userId: workerUser.id } });
  if (demoWorker) {
    await prisma.workerProfile.update({
      where: { id: demoWorker.id },
      data: {
        dateOfBirth: new Date("1994-05-02"),
        address: "15 Allen Avenue, Ikeja, Lagos",
        profileStatus: "APPROVED",
        certStatus: "APPROVED",
        backgroundCheckStatus: "CLEAR",
        completionPercent: 100,
        searchable: true,
        certificateNumber: "CPD-UK-88213",
        certProgramme: "Oakvale Caregiver Certification",
      },
    });
    const docTypes = [
      ["NIN", "nin.webp"],
      ["SELFIE", "selfie.webp"],
      ["ADDRESS_PROOF", "address.pdf"],
      ["POLICE_REPORT", "police.pdf"],
      ["CERTIFICATE", "certificate.pdf"],
    ] as const;
    for (const [type, fileName] of docTypes) {
      const exists = await prisma.workerDocument.findFirst({ where: { workerId: demoWorker.id, type } });
      if (!exists) {
        await prisma.workerDocument.create({
          data: { workerId: demoWorker.id, type, fileUrl: `/api/files/${fileName}`, fileName, status: "APPROVED" },
        });
      }
    }
    if (!(await prisma.education.findFirst({ where: { workerId: demoWorker.id } }))) {
      await prisma.education.create({
        data: {
          workerId: demoWorker.id,
          institution: "University of Lagos",
          qualification: "Diploma in Health & Social Care",
          startYear: 2012,
          endYear: 2015,
        },
      });
    }
    if (!(await prisma.experience.findFirst({ where: { workerId: demoWorker.id } }))) {
      await prisma.experience.create({
        data: {
          workerId: demoWorker.id,
          employer: "Private household",
          roleTitle: "Live-in caregiver",
          current: true,
          description: "Elderly care, medication management, and companionship.",
        },
      });
    }

    // A live public job from the corporate employer + a sample application.
    const corp = await prisma.employerProfile.findFirst({ where: { user: { email: "corp@oakvale.test" } } });
    const earlyYears = await prisma.careType.findUnique({ where: { slug: "early-years" } });
    if (corp) {
      let job = await prisma.job.findFirst({ where: { employerId: corp.id, title: "Crèche Childcare Worker" } });
      if (!job) {
        job = await prisma.job.create({
          data: {
            employerId: corp.id,
            title: "Crèche Childcare Worker",
            workforceCategoryId: childcare.id,
            description:
              "We're hiring a certified childcare worker for our on-site corporate crèche in Victoria Island. Early years experience and child safeguarding awareness essential. Monday to Friday.",
            state: "Lagos",
            lga: "Eti-Osa",
            employmentType: "FULL_TIME",
            salaryMin: 120000,
            salaryMax: 180000,
            salaryCurrency: "NGN",
            visibility: "PUBLIC",
            status: "APPROVED",
            ...(earlyYears ? { careTypes: { create: [{ careTypeId: earlyYears.id }] } } : {}),
          },
        });
      }
      const existingApp = await prisma.application.findUnique({
        where: { jobId_workerId: { jobId: job.id, workerId: demoWorker.id } },
      });
      if (!existingApp) {
        await prisma.application.create({
          data: {
            jobId: job.id,
            workerId: demoWorker.id,
            status: "APPLIED",
            coverNote: "I'm Oakvale-certified with early-years experience and would love to join your crèche.",
          },
        });
      }
    }
  }

  // --- Stage 2: contract templates (admin-managed, legal to replace) ---
  const templates: { type: "WORKER_PLACEMENT" | "EMPLOYER_SERVICE"; name: string; body: string }[] = [
    {
      type: "WORKER_PLACEMENT",
      name: "Worker Placement Agreement (default)",
      body: [
        "WORKER PLACEMENT AGREEMENT",
        "This agreement is made between Oakvale Learning Ltd and {{worker.full_name}} (the \"Worker\") on {{date.today}}.",
        "1. ROLE",
        "The Worker is placed as {{placement.role_title}} ({{worker.role_category}}) commencing {{placement.start_date}} at {{placement.location}}.",
        "2. REMUNERATION",
        "Agreed remuneration: {{placement.salary}}.",
        "3. CODE OF CONDUCT",
        "The Worker agrees to uphold the Oakvale code of conduct, maintain professional standards, and complete required CPD refreshers.",
        "4. RECOURSE",
        "Either party may raise a complaint through the Oakvale platform. A {{guarantee.window_days}}-day replacement guarantee applies from the placement start date.",
        "5. CONSENT",
        "By signing digitally, the Worker affirms they have read and accept these terms.",
      ].join("\n"),
    },
    {
      type: "EMPLOYER_SERVICE",
      name: "Employer Service Agreement (default)",
      body: [
        "EMPLOYER SERVICE AGREEMENT",
        "This agreement is made between Oakvale Learning Ltd and {{employer.name}} ({{employer.type}}, the \"Employer\") on {{date.today}}.",
        "1. SERVICE SCOPE",
        "Oakvale places a verified {{worker.role_category}} ({{worker.full_name}}) as {{placement.role_title}} commencing {{placement.start_date}}.",
        "2. FEES",
        "Placement fee: {{pricing.placement_fee}}, invoiced on 30-day net terms.",
        "3. REPLACEMENT GUARANTEE",
        "Oakvale provides a {{guarantee.replacement_days}}-day replacement guarantee at no additional placement fee if the placement ends within the window.",
        "4. COMPLIANCE",
        "Both parties agree to NDPA 2023 / GDPR-aware handling of personal data and to Oakvale's reporting schedule.",
        "5. CONSENT",
        "Signed digitally by {{employer.contact_name}} on behalf of the Employer.",
      ].join("\n"),
    },
  ];
  for (const t of templates) {
    const exists = await prisma.contractTemplate.findFirst({ where: { type: t.type } });
    if (!exists) await prisma.contractTemplate.create({ data: t });
  }

  // --- Stage 2 demo: an executed placement with welfare check + paid invoice ---
  // Assign the agent as account manager for both seeded employers.
  await prisma.employerProfile.updateMany({
    where: { user: { email: { in: ["family@oakvale.test", "corp@oakvale.test"] } } },
    data: { assignedAgentId: agent.id },
  });

  const familyEmp = await prisma.employerProfile.findFirst({
    where: { user: { email: "family@oakvale.test" } },
  });
  const demoWorker2 = await prisma.workerProfile.findUnique({ where: { userId: workerUser.id } });
  if (familyEmp && demoWorker2) {
    // A diaspora elderly-care job matching the caregiver worker.
    let placementJob = await prisma.job.findFirst({
      where: { employerId: familyEmp.id, title: "Live-in Elderly Caregiver (Diaspora)" },
    });
    if (!placementJob) {
      placementJob = await prisma.job.create({
        data: {
          employerId: familyEmp.id,
          title: "Live-in Elderly Caregiver (Diaspora)",
          workforceCategoryId: caregiver.id,
          description:
            "Live-in caregiver for an elderly relative in Ikeja, Lagos. Managed placement via Oakvale account manager.",
          state: "Lagos",
          lga: "Ikeja",
          employmentType: "LIVE_IN",
          salaryMin: 180000,
          salaryMax: 220000,
          salaryCurrency: "NGN",
          visibility: "RESTRICTED",
          status: "APPROVED",
        },
      });
    }

    let placement = await prisma.placement.findFirst({
      where: { workerId: demoWorker2.id, jobId: placementJob.id },
    });
    if (!placement) {
      // Application → accepted offer → executed placement.
      const app = await prisma.application.upsert({
        where: { jobId_workerId: { jobId: placementJob.id, workerId: demoWorker2.id } },
        update: { status: "HIRED" },
        create: { jobId: placementJob.id, workerId: demoWorker2.id, status: "HIRED" },
      });
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 20);
      const offer = await prisma.offer.upsert({
        where: { applicationId: app.id },
        update: {},
        create: {
          applicationId: app.id,
          roleTitle: "Live-in Elderly Caregiver",
          startDate,
          employmentType: "LIVE_IN",
          salary: 200000,
          salaryCurrency: "NGN",
          location: "Ikeja, Lagos",
          hours: "Live-in, 5 days/week",
          status: "ACCEPTED",
        },
      });
      const guaranteeEnds = new Date(startDate);
      guaranteeEnds.setDate(guaranteeEnds.getDate() + 90);
      placement = await prisma.placement.create({
        data: {
          workerId: demoWorker2.id,
          employerId: familyEmp.id,
          jobId: placementJob.id,
          offerId: offer.id,
          roleTitle: "Live-in Elderly Caregiver",
          startDate,
          status: "ACTIVE",
          salary: 200000,
          salaryCurrency: "NGN",
          guaranteeWindowEnds: guaranteeEnds,
          accountManagerId: agent.id,
        },
      });

      // Start CPD tracking (next due ~11 months out → CURRENT).
      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 11);
      await prisma.workerProfile.update({
        where: { id: demoWorker2.id },
        data: { cpdLastCompletedAt: startDate, cpdNextDueAt: nextDue },
      });

      // Executed contracts (both sides signed) — text stored; PDFs generated in the live flow.
      const commonVars: Record<string, string> = {
        "{{worker.full_name}}": "Amina Bello",
        "{{placement.role_title}}": "Live-in Elderly Caregiver",
        "{{placement.location}}": "Ikeja, Lagos",
        "{{placement.salary}}": "₦200,000",
        "{{placement.start_date}}": startDate.toDateString(),
        "{{worker.role_category}}": "Certified Caregiver (Elderly / Home Care)",
        "{{employer.name}}": "Tunde Familyman",
        "{{employer.type}}": "Individual / Family",
        "{{employer.contact_name}}": "Tunde Familyman",
        "{{guarantee.window_days}}": "90",
        "{{guarantee.replacement_days}}": "90",
        "{{pricing.placement_fee}}": "₦200,000",
        "{{date.today}}": startDate.toDateString(),
      };
      const fill = (body: string) =>
        Object.entries(commonVars).reduce((s, [k, v]) => s.split(k).join(v), body);
      for (const t of templates) {
        await prisma.contract.create({
          data: {
            placementId: placement.id,
            type: t.type,
            populatedBody: fill(t.body),
            status: "EXECUTED",
            partySignedAt: startDate,
            oakvaleSignedAt: startDate,
          },
        });
      }

      // One welfare check.
      await prisma.welfareCheck.create({
        data: {
          placementId: placement.id,
          agentId: agent.id,
          method: "CALL",
          attendanceConfirmed: true,
          wellbeing: "GREEN",
          issues: null,
          actionTaken: "Routine monthly check — care recipient settled, no concerns.",
        },
      });

      // Placement-fee invoice (paid).
      const invCount = await prisma.invoice.count();
      await prisma.invoice.create({
        data: {
          number: `OAK-INV-${String(invCount + 1).padStart(4, "0")}`,
          employerId: familyEmp.id,
          placementId: placement.id,
          type: "PLACEMENT_FEE",
          amount: 200000,
          currency: "NGN",
          status: "PAID",
          paidAt: new Date(),
          lineItems: [{ description: "Placement fee — Live-in Elderly Caregiver", amount: 200000 }],
        },
      });
    }
  }

  // --- Stage 3 demo: reviews + outcome-learned matching ---
  // Base matching weights (admin-editable defaults).
  await prisma.matchingModel.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      baseWeights: {
        category: 40,
        location: 25,
        relocate: 12,
        employmentType: 20,
        availability: 15,
        rating: 20,
      },
    },
  });

  const corpEmp = await prisma.employerProfile.findFirst({
    where: { user: { email: "corp@oakvale.test" } },
    include: { user: true },
  });
  const familyEmp3 = await prisma.employerProfile.findFirst({
    where: { user: { email: "family@oakvale.test" } },
    include: { user: true },
  });

  // Two-sided reviews on the live (active) caregiver placement so ratings render.
  const activePlacement = await prisma.placement.findFirst({
    where: { worker: { userId: workerUser.id }, status: "ACTIVE" },
    include: { worker: { include: { user: true } }, employer: { include: { user: true } } },
  });
  if (activePlacement) {
    await prisma.review.upsert({
      where: { placementId_direction: { placementId: activePlacement.id, direction: "EMPLOYER_ON_WORKER" } },
      update: {},
      create: {
        placementId: activePlacement.id,
        authorId: activePlacement.employer.userId,
        subjectId: activePlacement.worker.userId,
        direction: "EMPLOYER_ON_WORKER",
        rating: 5,
        comment: "Amina has been exceptional — punctual, warm, and deeply professional with my mother.",
      },
    });
    await prisma.review.upsert({
      where: { placementId_direction: { placementId: activePlacement.id, direction: "WORKER_ON_EMPLOYER" } },
      update: {},
      create: {
        placementId: activePlacement.id,
        authorId: activePlacement.worker.userId,
        subjectId: activePlacement.employer.userId,
        direction: "WORKER_ON_EMPLOYER",
        rating: 5,
        comment: "A respectful, communicative family. Payments always on time and clear expectations.",
      },
    });
  }

  // Helper: an approved, searchable demo worker.
  async function ensureWorker(
    email: string,
    name: string,
    categoryId: string,
    state: string,
    willingToRelocate: boolean,
  ) {
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        passwordHash,
        role: "WORKER",
        name,
        workerProfile: {
          create: {
            state,
            workforceCategoryId: categoryId,
            employmentTypes: ["FULL_TIME", "LIVE_IN"],
            willingToRelocate,
            experienceLevel: "Experienced",
            profileStatus: "APPROVED",
            certStatus: "APPROVED",
            backgroundCheckStatus: "CLEAR",
            completionPercent: 100,
            searchable: true,
          },
        },
      },
      include: { workerProfile: true },
    });
    return u.workerProfile!;
  }

  // Helper: a completed (ENDED) placement carrying a success/failure outcome.
  async function ensureEndedPlacement(opts: {
    worker: { id: string; userId: string };
    employer: { id: string; userId: string };
    categoryId: string;
    title: string;
    state: string;
    outcome: "success" | "failure";
  }) {
    let job = await prisma.job.findFirst({ where: { employerId: opts.employer.id, title: opts.title } });
    if (!job) {
      job = await prisma.job.create({
        data: {
          employerId: opts.employer.id,
          title: opts.title,
          workforceCategoryId: opts.categoryId,
          description: "Completed managed placement (demo history for matching outcomes).",
          state: opts.state,
          employmentType: "FULL_TIME",
          salaryMin: 120000,
          salaryMax: 180000,
          salaryCurrency: "NGN",
          visibility: "RESTRICTED",
          status: "APPROVED",
        },
      });
    }
    const existing = await prisma.placement.findFirst({ where: { workerId: opts.worker.id, jobId: job.id } });
    if (existing) return existing;

    const app = await prisma.application.upsert({
      where: { jobId_workerId: { jobId: job.id, workerId: opts.worker.id } },
      update: { status: "HIRED" },
      create: { jobId: job.id, workerId: opts.worker.id, status: "HIRED" },
    });
    const start = new Date();
    start.setMonth(start.getMonth() - 8);
    const offer = await prisma.offer.upsert({
      where: { applicationId: app.id },
      update: {},
      create: {
        applicationId: app.id,
        roleTitle: opts.title,
        startDate: start,
        employmentType: "FULL_TIME",
        salary: 150000,
        salaryCurrency: "NGN",
        location: opts.state,
        status: "ACCEPTED",
      },
    });
    const guaranteeEnds = new Date(start);
    guaranteeEnds.setDate(guaranteeEnds.getDate() + 90);
    const ended = new Date();
    ended.setMonth(ended.getMonth() - 1);
    const placement = await prisma.placement.create({
      data: {
        workerId: opts.worker.id,
        employerId: opts.employer.id,
        jobId: job.id,
        offerId: offer.id,
        roleTitle: opts.title,
        startDate: start,
        status: "ENDED",
        actualEndDate: ended,
        salary: 150000,
        salaryCurrency: "NGN",
        guaranteeWindowEnds: guaranteeEnds,
        accountManagerId: agent.id,
      },
    });

    if (opts.outcome === "success") {
      await prisma.review.create({
        data: {
          placementId: placement.id,
          authorId: opts.employer.userId,
          subjectId: opts.worker.userId,
          direction: "EMPLOYER_ON_WORKER",
          rating: 5,
          comment: "Reliable and skilled throughout the contract — would hire again without hesitation.",
        },
      });
    } else {
      await prisma.review.create({
        data: {
          placementId: placement.id,
          authorId: opts.employer.userId,
          subjectId: opts.worker.userId,
          direction: "EMPLOYER_ON_WORKER",
          rating: 2,
          comment: "Attendance was inconsistent and the placement had to be ended early.",
        },
      });
      const caseCount = await prisma.complaint.count();
      await prisma.complaint.create({
        data: {
          caseRef: `OAK-C-${String(caseCount + 1).padStart(4, "0")}`,
          category: "WORKER_NON_ATTENDANCE",
          urgency: "HIGH",
          status: "RESOLVED",
          stage: "COMMUNICATION",
          raisedById: opts.employer.userId,
          againstUserId: opts.worker.userId,
          placementId: placement.id,
          description: "Repeated unexplained absences over the final month of the placement.",
          resolutionNotes: "Placement ended; guarantee replacement offered to the employer.",
        },
      });
    }
    return placement;
  }

  // A well-reviewed worker (success) and an under-performing one (failure) give the
  // learner both signals so the outcome-tuned weights differ from the raw defaults.
  if (corpEmp && familyEmp3) {
    const james = await ensureWorker("worker.james@oakvale.test", "James Okoro", childcare.id, "Lagos", true);
    const grace = await ensureWorker("worker.grace@oakvale.test", "Grace Abu", caregiver.id, "Kano", false);
    await ensureEndedPlacement({
      worker: { id: james.id, userId: james.userId },
      employer: { id: corpEmp.id, userId: corpEmp.userId },
      categoryId: childcare.id,
      title: "Crèche Assistant (completed)",
      state: "Lagos",
      outcome: "success",
    });
    await ensureEndedPlacement({
      worker: { id: grace.id, userId: grace.userId },
      employer: { id: familyEmp3.id, userId: familyEmp3.userId },
      categoryId: caregiver.id,
      title: "Home Caregiver (completed)",
      state: "Lagos",
      outcome: "failure",
    });
  }

  // Refresh cached ratings for every reviewed subject, then learn the weights.
  const subjects = await prisma.review.findMany({ distinct: ["subjectId"], select: { subjectId: true } });
  for (const s of subjects) await recomputeSubjectRating(s.subjectId);
  await recomputeMatchingWeights();

  console.log("Seed complete.");
  console.log("Sample logins (password: Password123!):");
  console.log("  admin@oakvale.test, agent@oakvale.test");
  console.log("  worker@oakvale.test");
  console.log("  family@oakvale.test (individual), corp@oakvale.test (organization)");
  console.log({ adminId: admin.id, workerUserId: workerUser.id, childcareId: childcare.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
