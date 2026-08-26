import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import AssignManagerButton from "@/components/agent/AssignManagerButton";
import IssueSubscriptionButton from "@/components/agent/IssueSubscriptionButton";
import SuspendEmployerButton from "@/components/admin/SuspendEmployerButton";
import { PageTransition } from "@/components/motion";
import {
  verificationStatusMeta,
  jobStatusMeta,
  placementStatusMeta,
  invoiceStatusMeta,
  invoiceTypeLabels,
  formatMoney,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 2.5 }}>
        <Typography variant="h4">{value}</Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default async function EmployerAccountDetail({ params }: PageProps<"/agent/accounts/[id]">) {
  const user = await requireAgent();
  const { id } = await params;

  const employer = await prisma.employerProfile.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      employerType: { select: { name: true } },
      assignedAgent: { select: { id: true, name: true } },
      jobs: {
        where: { deletedAt: null },
        orderBy: { createdAt: "desc" },
        include: {
          workforceCategory: { select: { name: true } },
          _count: { select: { applications: true } },
        },
      },
      placements: {
        orderBy: { startDate: "desc" },
        include: { worker: { include: { user: { select: { name: true } } } } },
      },
      invoices: { orderBy: { createdAt: "desc" } },
      _count: { select: { shortlists: true } },
    },
  });
  if (!employer || employer.deletedAt) notFound();

  const name = employer.orgName ?? employer.contactName ?? employer.user.name;
  const applicationsReceived = employer.jobs.reduce((sum, j) => sum + j._count.applications, 0);
  const activePlacements = employer.placements.filter((p) => p.status === "ACTIVE").length;

  const paid = employer.invoices.filter((i) => i.status === "PAID");
  const outstanding = employer.invoices.filter((i) => i.status === "ISSUED" || i.status === "OVERDUE");
  const totalPaid = paid.reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = outstanding.reduce((s, i) => s + i.amount, 0);

  return (
    <PageTransition>
      <LinkButton href="/agent/accounts" size="small" sx={{ mb: 2 }}>
        ← All accounts
      </LinkButton>

      {/* Header + account controls */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ minWidth: 0 }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                <Typography variant="h4">{name}</Typography>
                {employer.suspendedAt && <Chip label="Suspended" size="small" color="error" />}
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {employer.kind === "ORGANIZATION" ? "Organization" : "Individual / Family"}
                {employer.employerType?.name ? ` · ${employer.employerType.name}` : ""} · {employer.user.email}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                {employer.kind === "ORGANIZATION" && `Sector: ${employer.sector ?? "—"} · CAC: ${employer.cacNumber ?? "—"} · `}
                Account manager: {employer.assignedAgent?.name ?? "Unassigned"}
              </Typography>
              {employer.suspendedAt && employer.suspendedReason && (
                <Typography variant="body2" color="error" sx={{ mt: 0.75, fontStyle: "italic" }}>
                  Suspended {formatDate(employer.suspendedAt)}: {employer.suspendedReason}
                </Typography>
              )}
            </Box>
            <Stack spacing={1} sx={{ alignItems: "flex-end" }}>
              <StatusBadge meta={verificationStatusMeta[employer.verificationStatus]} />
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", justifyContent: "flex-end", gap: 1 }}>
                <AssignManagerButton
                  employerId={employer.id}
                  agentId={user.id}
                  assigned={employer.assignedAgent?.id === user.id}
                />
                {employer.kind === "ORGANIZATION" && employer.verificationStatus === "APPROVED" && (
                  <IssueSubscriptionButton employerId={employer.id} />
                )}
                <SuspendEmployerButton id={employer.id} suspended={!!employer.suspendedAt} />
              </Stack>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Hiring activity snapshot */}
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Hiring activity
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}><StatTile label="Jobs posted" value={employer.jobs.length} /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatTile label="Applications received" value={applicationsReceived} /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatTile label="Shortlisted workers" value={employer._count.shortlists} /></Grid>
        <Grid size={{ xs: 6, sm: 3 }}><StatTile label="Active placements" value={activePlacements} /></Grid>
      </Grid>

      {/* Jobs */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Jobs
      </Typography>
      {employer.jobs.length === 0 ? (
        <EmptyState title="No jobs posted" />
      ) : (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {employer.jobs.map((j) => (
            <Card key={j.id}>
              <CardContent sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{j.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {j.workforceCategory?.name ?? "—"} · {j._count.applications} application{j._count.applications === 1 ? "" : "s"} · posted {formatDate(j.createdAt)}
                  </Typography>
                </Box>
                <StatusBadge meta={jobStatusMeta[j.status]} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      {/* Placements */}
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Placements
      </Typography>
      {employer.placements.length === 0 ? (
        <EmptyState title="No placements yet" />
      ) : (
        <Stack spacing={1.5} sx={{ mb: 3 }}>
          {employer.placements.map((p) => (
            <Card key={p.id}>
              <CardContent sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{p.roleTitle}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {p.worker.user.name} · started {formatDate(p.startDate)}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                  <StatusBadge meta={placementStatusMeta[p.status]} />
                  <LinkButton href={`/agent/placements/${p.id}`} size="small" variant="outlined">
                    View
                  </LinkButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      {/* Billing & payment history */}
      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Billing &amp; payment history
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4 }}><StatTile label="Invoices" value={employer.invoices.length} /></Grid>
        <Grid size={{ xs: 6, sm: 4 }}><StatTile label="Total paid" value={formatMoney(totalPaid, "NGN")} /></Grid>
        <Grid size={{ xs: 12, sm: 4 }}><StatTile label="Outstanding" value={formatMoney(totalOutstanding, "NGN")} /></Grid>
      </Grid>

      {employer.invoices.length === 0 ? (
        <EmptyState title="No invoices" description="Invoices appear here once the employer has a placement or subscription." />
      ) : (
        <Stack spacing={1.5}>
          {employer.invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{inv.number}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoiceTypeLabels[inv.type]} · {formatMoney(inv.amount, inv.currency)} · due {inv.dueAt ? formatDate(inv.dueAt) : "—"}
                    {inv.paidAt ? ` · paid ${formatDate(inv.paidAt)}` : ""}
                  </Typography>
                </Box>
                <StatusBadge meta={invoiceStatusMeta[inv.status]} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
