import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";

/** CSV export of pending certificate submissions for bulk cross-referencing. */
export async function GET() {
  const session = await auth();
  if (!session?.user || !["ADMIN", "AGENT"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const workers = await prisma.workerProfile.findMany({
    where: { certStatus: "PENDING", deletedAt: null },
    include: { user: true, documents: { where: { type: "CERTIFICATE" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });

  const headers = [
    "Worker Name",
    "Email",
    "Phone",
    "Certificate Number",
    "Programme",
    "Completion Date",
    "Certificate File",
    "Submitted",
  ];

  const rows = workers.map((w) => [
    w.user.name,
    w.user.email,
    w.user.phone ?? "",
    w.certificateNumber ?? "",
    w.certProgramme ?? "",
    w.certCompletionDate ? w.certCompletionDate.toISOString().slice(0, 10) : "",
    w.documents[0]?.fileUrl ?? "",
    w.updatedAt.toISOString(),
  ]);

  const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\r\n");

  await audit({
    userId: session.user.id,
    action: "certificates.exported_csv",
    entityType: "WorkerProfile",
    meta: { count: workers.length },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pending-certificates-${new Date()
        .toISOString()
        .slice(0, 10)}.csv"`,
    },
  });
}
