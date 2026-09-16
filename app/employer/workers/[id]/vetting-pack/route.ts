import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { renderDocumentPdf } from "@/lib/pdf";
import { canViewVettingPack } from "@/lib/subscription";
import { documentTypeLabels } from "@/lib/constants";
import { formatDate } from "@/lib/format";

/**
 * US-2.1 — the downloadable half of the Enhanced Vetting Pack: a single PDF
 * summarising verified ID confirmation, police clearance status and the
 * Oakvale transcript summary for one candidate.
 *
 * Diaspora Sponsors only. A local subscriber gets 403 here; the UI never shows
 * them the link in the first place, offering the upgrade explanation instead.
 */
export async function GET(
  _req: Request,
  ctx: RouteContext<"/employer/workers/[id]/vetting-pack">,
) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "EMPLOYER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const employer = await prisma.employerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!canViewVettingPack(employer)) {
    return NextResponse.json(
      { error: "The Enhanced Vetting Pack is a Diaspora Sponsor feature." },
      { status: 403 },
    );
  }

  const { id } = await ctx.params;
  const worker = await prisma.workerProfile.findFirst({
    where: { id, searchable: true, deletedAt: null },
    include: {
      user: { select: { name: true } },
      workforceCategory: true,
      educations: { orderBy: { createdAt: "asc" } },
      documents: true,
    },
  });
  if (!worker) return NextResponse.json({ error: "Candidate not found" }, { status: 404 });

  const verified = (type: string) =>
    worker.documents.some((d) => d.type === type && d.status === "APPROVED");

  const idDocs = ["NIN", "PASSPORT", "VOTER_CARD", "DRIVERS_LICENCE"] as const;
  const heldIdDocs = idDocs.filter((t) => worker.documents.some((d) => d.type === t));

  const body = [
    "CANDIDATE",
    `Name: ${worker.user.name}`,
    `Category: ${worker.workforceCategory?.name ?? "Care worker"}`,
    `Location: ${[worker.lga, worker.state].filter(Boolean).join(", ") || "Not stated"}`,
    `Experience level: ${worker.experienceLevel ?? "Not stated"}`,
    "",
    "IDENTITY VERIFICATION",
    `Status: ${heldIdDocs.length > 0 ? "Government ID on file" : "No government ID on file"}`,
    ...heldIdDocs.map(
      (t) => `- ${documentTypeLabels[t]}: ${verified(t) ? "Verified by Oakvale" : "Submitted, pending verification"}`,
    ),
    `Liveness selfie: ${
      worker.documents.some((d) => d.type === "SELFIE") ? "On file" : "Not submitted"
    }`,
    "",
    "POLICE CLEARANCE",
    `Background check status: ${worker.backgroundCheckStatus.replace(/_/g, " ").toLowerCase()}`,
    `Police report document: ${
      worker.documents.some((d) => d.type === "POLICE_REPORT")
        ? verified("POLICE_REPORT")
          ? "On file, verified"
          : "On file, pending verification"
        : "Not submitted"
    }`,
    `Affidavit of good conduct: ${
      worker.documents.some((d) => d.type === "AFFIDAVIT") ? "On file" : "Not submitted"
    }`,
    "",
    "OAKVALE TRANSCRIPT SUMMARY",
    `Certification status: ${worker.certStatus.replace(/_/g, " ").toLowerCase()}`,
    `Programme: ${worker.certProgramme ?? "Not stated"}`,
    `Certificate number: ${worker.certificateNumber ?? "Not stated"}`,
    `Completed: ${worker.certCompletionDate ? formatDate(worker.certCompletionDate) : "Not stated"}`,
    `CPD hours logged: ${worker.cpdHours ?? 0}`,
    `Next CPD refresh due: ${worker.cpdNextDueAt ? formatDate(worker.cpdNextDueAt) : "Not scheduled"}`,
    "",
    "EDUCATION",
    ...(worker.educations.length > 0
      ? worker.educations.map((e) => `- ${e.qualification} — ${e.institution}`)
      : ["- None recorded"]),
    "",
    "VIDEO INTRODUCTION",
    worker.documents.some((d) => d.type === "VIDEO_INTRO")
      ? "A 60–90 second video introduction is available on this candidate's profile."
      : "No video introduction on file.",
  ].join("\n");

  const pdf = await renderDocumentPdf({
    title: "Enhanced Vetting Pack",
    subtitle: `${worker.user.name} · prepared ${formatDate(new Date())}`,
    body,
    footer:
      "Confidential. Prepared by Oakvale Learning Ltd for the named sponsor only. " +
      "Verification statuses reflect Oakvale's records at the time of download.",
  });

  await audit({
    userId: session.user.id,
    action: "vetting_pack.downloaded",
    entityType: "WorkerProfile",
    entityId: worker.id,
  });

  const filename = `oakvale-vetting-pack-${worker.user.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`;
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
