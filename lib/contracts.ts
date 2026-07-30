import { prisma } from "@/lib/prisma";
import { storage } from "@/lib/storage";
import { renderDocumentPdf } from "@/lib/pdf";
import {
  GUARANTEE_DAYS,
  contractTypeLabels,
  formatMoney,
  DEFAULT_PLACEMENT_FEE_NGN,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ContractType, Currency } from "@/generated/prisma/client";

/** Replaces {{dotted.keys}} in a template body from a flat variable map. */
export function substituteVars(body: string, vars: Record<string, string>): string {
  return body.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_m, key: string) => vars[key] ?? `[${key}]`);
}

/** Placement-fee amount (NGN) for an employer type, from its config JSON. */
export function placementFeeFor(config: unknown): number {
  if (config && typeof config === "object" && "placementFee" in config) {
    const v = (config as Record<string, unknown>).placementFee;
    if (typeof v === "number" && v > 0) return v;
  }
  return DEFAULT_PLACEMENT_FEE_NGN;
}

type PlacementWithParties = {
  roleTitle: string;
  startDate: Date;
  salary: number | null;
  salaryCurrency: Currency;
  guaranteeWindowEnds: Date | null;
  worker: { user: { name: string }; certificateNumber: string | null; workforceCategory: { name: string } | null };
  employer: {
    kind: string;
    orgName: string | null;
    contactName: string | null;
    user: { name: string };
    employerType: { name: string } | null;
  };
  job: { state: string | null; lga: string | null };
};

function buildVars(p: PlacementWithParties, placementFee: number): Record<string, string> {
  const location = [p.job.lga, p.job.state].filter(Boolean).join(", ") || "As agreed";
  return {
    "worker.full_name": p.worker.user.name,
    "worker.certificate_number": p.worker.certificateNumber || "On file with Oakvale",
    "worker.role_category": p.worker.workforceCategory?.name || p.roleTitle,
    "employer.name": p.employer.orgName || p.employer.user.name,
    "employer.type": p.employer.employerType?.name || (p.employer.kind === "ORGANIZATION" ? "Organization" : "Individual / Family"),
    "employer.contact_name": p.employer.contactName || p.employer.user.name,
    "placement.role_title": p.roleTitle,
    "placement.start_date": formatDate(p.startDate),
    "placement.location": location,
    "placement.salary": p.salary ? formatMoney(p.salary, p.salaryCurrency) : "As agreed",
    "guarantee.replacement_days": String(GUARANTEE_DAYS),
    "guarantee.window_days": String(GUARANTEE_DAYS),
    "pricing.placement_fee": formatMoney(placementFee, "NGN"),
    "date.today": formatDate(new Date()),
  };
}

/**
 * Generates the Worker Placement + Employer Service contracts for a placement
 * (idempotent — skips a contract type that already exists). Renders a branded PDF
 * per contract and stores it. Run AFTER the offer-accept transaction commits.
 */
export async function generatePlacementContracts(placementId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: {
      worker: { include: { user: true, workforceCategory: true } },
      employer: { include: { user: true, employerType: true } },
      job: true,
    },
  });
  if (!placement) return;

  const placementFee = placementFeeFor(placement.employer.employerType?.config);
  const vars = buildVars(placement, placementFee);

  const types: ContractType[] = ["WORKER_PLACEMENT", "EMPLOYER_SERVICE"];
  for (const type of types) {
    const existing = await prisma.contract.findFirst({ where: { placementId, type } });
    if (existing) continue;

    const template = await prisma.contractTemplate.findFirst({
      where: { type, active: true, deletedAt: null },
      orderBy: { version: "desc" },
    });
    const body = template ? substituteVars(template.body, vars) : fallbackBody(type, vars);

    const pdf = await renderDocumentPdf({
      title: contractTypeLabels[type],
      subtitle: `${vars["placement.role_title"]} · ${vars["worker.full_name"]} ↔ ${vars["employer.name"]}`,
      body,
      footer: "Oakvale Learning Ltd · jobs.oakvaleltd.com · This document is an affirmative-consent agreement signed digitally within the Oakvale Jobs portal.",
    });
    const stored = await storage.saveBytes(pdf, {
      folder: "contracts",
      fileName: `${contractTypeLabels[type].replace(/\s+/g, "-")}.pdf`,
    });

    await prisma.contract.create({
      data: {
        placementId,
        type,
        templateId: template?.id ?? null,
        version: template?.version ?? 1,
        populatedBody: body,
        pdfKey: stored.key,
        pdfUrl: stored.url,
        status: "AWAITING_SIGNATURE",
        oakvaleSignedAt: new Date(), // Oakvale counter-signs on generation
      },
    });
  }
}

/** Minimal built-in body used when no admin template is configured yet. */
function fallbackBody(type: ContractType, vars: Record<string, string>): string {
  if (type === "WORKER_PLACEMENT") {
    return [
      "WORKER PLACEMENT AGREEMENT",
      `This agreement is made between Oakvale Learning Ltd and ${vars["worker.full_name"]} (the "Worker") on ${vars["date.today"]}.`,
      "1. ROLE",
      `The Worker is placed as ${vars["placement.role_title"]} (${vars["worker.role_category"]}) commencing ${vars["placement.start_date"]} at ${vars["placement.location"]}.`,
      "2. REMUNERATION",
      `Agreed remuneration: ${vars["placement.salary"]}.`,
      "3. CODE OF CONDUCT",
      "The Worker agrees to uphold the Oakvale code of conduct, maintain professional standards, and complete required CPD refreshers.",
      "4. RECOURSE",
      `Either party may raise a complaint through the Oakvale platform. A ${vars["guarantee.window_days"]}-day replacement guarantee applies from the placement start date.`,
      "5. CONSENT",
      "By signing digitally, the Worker affirms they have read and accept these terms.",
    ].join("\n");
  }
  return [
    "EMPLOYER SERVICE AGREEMENT",
    `This agreement is made between Oakvale Learning Ltd and ${vars["employer.name"]} (${vars["employer.type"]}, the "Employer") on ${vars["date.today"]}.`,
    "1. SERVICE SCOPE",
    `Oakvale places a verified ${vars["worker.role_category"]} (${vars["worker.full_name"]}) as ${vars["placement.role_title"]} commencing ${vars["placement.start_date"]}.`,
    "2. FEES",
    `Placement fee: ${vars["pricing.placement_fee"]}, invoiced on 30-day net terms.`,
    "3. REPLACEMENT GUARANTEE",
    `Oakvale provides a ${vars["guarantee.replacement_days"]}-day replacement guarantee at no additional placement fee if the placement ends within the window.`,
    "4. COMPLIANCE",
    "Both parties agree to NDPA 2023 / GDPR-aware handling of personal data and to Oakvale's reporting schedule.",
    "5. CONSENT",
    `Signed digitally by ${vars["employer.contact_name"]} on behalf of the Employer.`,
  ].join("\n");
}
