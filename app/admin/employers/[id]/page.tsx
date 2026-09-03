import { notFound } from "next/navigation";
import NextLink from "next/link";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import {
  verificationStatusMeta,
  jobStatusMeta,
  placementStatusMeta,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import DocLinks from "@/components/admin/DocLinks";
import ReviewButtons from "@/components/admin/ReviewButtons";
import SuspendEmployerButton from "@/components/admin/SuspendEmployerButton";
import { decideEmployer } from "@/app/admin/actions";
import { PageTransition } from "@/components/motion";

const employerDocTypeLabels: Record<string, string> = {
  CAC: "CAC certificate",
  PROOF_OF_RESIDENCE: "Proof of residence",
  ID_DOCUMENT: "ID document",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value ?? "—"}</Typography>
    </Box>
  );
}

export default async function AdminEmployerManagePage({ params }: PageProps<"/admin/employers/[id]">) {
  await requireRole("ADMIN", "AGENT");
  const { id } = await params;

  const employer = await prisma.employerProfile.findFirst({
    where: { id, deletedAt: null },
    include: {
      user: true,
      documents: true,
      employerType: true,
      assignedAgent: { select: { name: true, email: true } },
      jobs: { orderBy: { createdAt: "desc" } },
      placements: {
        orderBy: { createdAt: "desc" },
        include: { worker: { include: { user: { select: { name: true } } } } },
      },
      _count: { select: { jobs: true, placements: true, invoices: true } },
    },
  });

  if (!employer) notFound();

  const displayName = employer.orgName ?? employer.contactName ?? employer.user.name;

  return (
    <PageTransition>
      <Button
        component={NextLink}
        href="/admin/employers"
        startIcon={<ArrowBackRoundedIcon />}
        size="small"
        sx={{ mb: 2 }}
      >
        Back to employers
      </Button>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
            <Typography variant="h4">{displayName}</Typography>
            <Chip label={employer.kind === "ORGANIZATION" ? "Organization" : "Individual"} size="small" />
            {employer.suspendedAt && <Chip label="Suspended" size="small" color="error" />}
          </Stack>
          <Typography color="text.secondary">
            {employer.user.email} · registered {formatDate(employer.createdAt)}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <StatusBadge meta={verificationStatusMeta[employer.verificationStatus]} />
          {employer.verificationStatus === "PENDING" ? (
            <ReviewButtons id={employer.id} action={decideEmployer} approveLabel="Verify" rejectLabel="Decline" />
          ) : (
            <SuspendEmployerButton id={employer.id} suspended={!!employer.suspendedAt} size="medium" />
          )}
        </Stack>
      </Box>

      {employer.suspendedAt && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Suspended {formatDate(employer.suspendedAt)}
          {employer.suspendedReason ? `: ${employer.suspendedReason}` : "."}
        </Alert>
      )}
      {employer.verificationStatus === "REJECTED" && employer.reviewNotes && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Declined: {employer.reviewNotes}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Account details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}><Field label="Contact name" value={employer.contactName ?? employer.user.name} /></Grid>
                <Grid size={6}><Field label="Phone" value={employer.user.phone} /></Grid>
                <Grid size={6}><Field label="Employer type" value={employer.employerType?.name} /></Grid>
                <Grid size={6}><Field label="Country" value={employer.country} /></Grid>
                {employer.kind === "ORGANIZATION" && (
                  <>
                    <Grid size={6}><Field label="Sector" value={employer.sector} /></Grid>
                    <Grid size={6}><Field label="CAC number" value={employer.cacNumber} /></Grid>
                  </>
                )}
                <Grid size={12}><Field label="Address" value={employer.address} /></Grid>
                <Grid size={12}><Field label="Account manager" value={employer.assignedAgent ? `${employer.assignedAgent.name} (${employer.assignedAgent.email})` : "Unassigned"} /></Grid>
              </Grid>

              <Divider sx={{ my: 2.5 }} />
              <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
                Documents
              </Typography>
              {employer.documents.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No documents uploaded.</Typography>
              ) : (
                <DocLinks
                  docs={employer.documents.map((d) => ({
                    label: employerDocTypeLabels[d.type] ?? d.type,
                    fileUrl: d.fileUrl,
                  }))}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Activity
              </Typography>
              <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
                <Box>
                  <Typography variant="h4">{employer._count.jobs}</Typography>
                  <Typography variant="body2" color="text.secondary">Jobs posted</Typography>
                </Box>
                <Box>
                  <Typography variant="h4">{employer._count.placements}</Typography>
                  <Typography variant="body2" color="text.secondary">Placements</Typography>
                </Box>
                <Box>
                  <Typography variant="h4">{employer._count.invoices}</Typography>
                  <Typography variant="body2" color="text.secondary">Invoices</Typography>
                </Box>
              </Stack>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>Placements</Typography>
              {employer.placements.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No placements yet.</Typography>
              ) : (
                <Stack spacing={1}>
                  {employer.placements.map((p) => (
                    <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
                      <Typography variant="body2">{p.worker.user.name}</Typography>
                      <StatusBadge meta={placementStatusMeta[p.status]} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mt: 4, mb: 1.5 }}>
        Jobs ({employer.jobs.length})
      </Typography>
      {employer.jobs.length === 0 ? (
        <EmptyState title="This employer has not posted any jobs" />
      ) : (
        <Stack spacing={1.5}>
          {employer.jobs.map((job) => (
            <Card key={job.id}>
              <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600 }}>{job.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posted {formatDate(job.createdAt)}
                  </Typography>
                </Box>
                <StatusBadge meta={jobStatusMeta[job.status]} />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
