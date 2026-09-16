import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { sendEmail, emailLayout } from "@/lib/email";
import { canUseCareOversight } from "@/lib/subscription";
import { formatDate } from "@/lib/format";

/**
 * Module 4 — the Digital Care Log workspace (US-4.1).
 *
 * A workspace is created when a placement goes active under a Diaspora Sponsor
 * account. The caregiver files routine updates from a mobile-friendly form; the
 * sponsor reads them from the dashboard and receives email digests.
 */

/**
 * Creates the shared workspace for a newly-active placement, when the hiring
 * account's plan includes remote oversight. Idempotent.
 *
 * Returns the workspace, or null when the employer isn't entitled to one.
 */
export async function ensureCareLogWorkspace(placementId: string) {
  const placement = await prisma.placement.findUnique({
    where: { id: placementId },
    include: { employer: true, worker: { include: { user: true } } },
  });
  if (!placement) return null;
  if (!canUseCareOversight(placement.employer)) return null;

  const existing = await prisma.careLogWorkspace.findUnique({ where: { placementId } });
  if (existing) return existing;

  const workspace = await prisma.careLogWorkspace.create({ data: { placementId } });

  await audit({
    action: "carelog.workspace.created",
    entityType: "Placement",
    entityId: placementId,
  });

  await notify({
    userId: placement.worker.userId,
    type: "carelog.workspace",
    title: "Daily care logs enabled",
    body: `Your sponsor for "${placement.roleTitle}" receives care updates through Oakvale. Add an entry after each shift.`,
    link: "/worker/care-logs",
    email: true,
  });

  await notify({
    userId: placement.employer.userId,
    type: "carelog.workspace",
    title: "Care log workspace ready",
    body: `You'll receive care updates for ${placement.worker.user.name} here.`,
    link: `/employer/care-logs/${workspace.id}`,
    email: true,
  });

  return workspace;
}

/** The workspaces a sponsor can read — their own placements only. */
export async function workspacesForEmployer(employerId: string) {
  return prisma.careLogWorkspace.findMany({
    where: { placement: { employerId } },
    include: {
      placement: {
        include: { worker: { include: { user: { select: { name: true } } } }, job: true },
      },
      entries: { orderBy: { loggedFor: "desc" }, take: 1 },
      _count: { select: { entries: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/** The workspaces a caregiver files entries into — their active placements. */
export async function workspacesForWorker(workerId: string) {
  return prisma.careLogWorkspace.findMany({
    where: { active: true, placement: { workerId, status: "ACTIVE" } },
    include: {
      placement: {
        include: { employer: { include: { user: { select: { name: true } } } } },
      },
      entries: { orderBy: { loggedFor: "desc" }, take: 5 },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Emails the sponsor a digest of entries filed since the last one, and marks
 * the watermark. Called after an entry is submitted.
 *
 * An entry the caregiver flagged as a concern bypasses batching and goes out on
 * its own — a sponsor abroad shouldn't wait on a digest window for that.
 */
export async function sendCareLogDigest(workspaceId: string, opts: { urgent?: boolean } = {}) {
  const workspace = await prisma.careLogWorkspace.findUnique({
    where: { id: workspaceId },
    include: {
      placement: {
        include: {
          employer: { include: { user: true } },
          worker: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });
  if (!workspace) return;

  const entries = await prisma.careLogEntry.findMany({
    where: {
      workspaceId,
      ...(workspace.lastDigestAt ? { createdAt: { gt: workspace.lastDigestAt } } : {}),
    },
    orderBy: { loggedFor: "desc" },
    take: 20,
  });
  if (entries.length === 0) return;

  const caregiver = workspace.placement.worker.user.name;
  const sponsor = workspace.placement.employer.user;

  const rows = entries
    .map((e) => {
      const metrics = [
        e.bloodPressure && `BP ${e.bloodPressure}`,
        e.temperature != null && `Temp ${e.temperature}°C`,
        e.pulse != null && `Pulse ${e.pulse}`,
        e.weight != null && `Weight ${e.weight}kg`,
      ]
        .filter(Boolean)
        .join(" · ");

      const detail = [
        e.medicationsTaken && `<strong>Medication:</strong> ${escapeHtml(e.medicationsTaken)}${
          e.medicationTime ? ` (${escapeHtml(e.medicationTime)})` : ""
        }`,
        e.meals && `<strong>Meals:</strong> ${escapeHtml(e.meals)}`,
        e.activities && `<strong>Activities:</strong> ${escapeHtml(e.activities)}`,
        e.mood && `<strong>Mood:</strong> ${escapeHtml(e.mood)}`,
        e.notes && `<strong>Notes:</strong> ${escapeHtml(e.notes)}`,
      ]
        .filter(Boolean)
        .join("<br/>");

      return `<div style="border-left:3px solid ${
        e.concernFlag ? "#c62828" : "#2E7D32"
      };padding:8px 12px;margin-bottom:12px">
        <div style="font-weight:700">${formatDate(e.loggedFor)}${
          e.concernFlag ? ' <span style="color:#c62828">· Needs attention</span>' : ""
        }</div>
        ${metrics ? `<div style="color:#5a665a;font-size:13px">${escapeHtml(metrics)}</div>` : ""}
        ${detail ? `<div style="margin-top:6px">${detail}</div>` : ""}
      </div>`;
    })
    .join("");

  const title = opts.urgent
    ? `Care update needs your attention — ${caregiver}`
    : `Care update from ${caregiver}`;

  if (sponsor.email) {
    await sendEmail({
      to: sponsor.email,
      subject: title,
      html: emailLayout(
        title,
        `<p>${entries.length} new care log ${
          entries.length === 1 ? "entry" : "entries"
        } for ${escapeHtml(workspace.placement.roleTitle)}.</p>${rows}`,
      ),
    });
  }

  await prisma.careLogWorkspace.update({
    where: { id: workspaceId },
    data: { lastDigestAt: new Date() },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
