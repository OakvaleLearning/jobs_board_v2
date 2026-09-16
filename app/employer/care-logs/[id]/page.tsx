import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBillingProfile, canUseCareOversight } from "@/lib/subscription";
import CareLogTimeline from "@/components/carelogs/CareLogTimeline";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";
import { formatDate } from "@/lib/format";

/** US-4.1 — one placement's care log, as the sponsor reads it. */
export default async function CareLogDetailPage({
  params,
}: PageProps<"/employer/care-logs/[id]">) {
  const user = await requireRole("EMPLOYER");
  const employer = await getBillingProfile(user.id);
  if (!canUseCareOversight(employer)) notFound();

  const { id } = await params;
  const workspace = await prisma.careLogWorkspace.findFirst({
    // Scoped to this sponsor's own placements — a workspace id alone is never
    // enough to read someone else's care data.
    where: { id, placement: { employerId: employer!.id } },
    include: {
      placement: {
        include: { worker: { include: { user: { select: { name: true } } } }, job: true },
      },
      entries: { orderBy: { loggedFor: "desc" }, take: 100 },
    },
  });
  if (!workspace) notFound();

  const { placement } = workspace;
  const concerns = workspace.entries.filter((e) => e.concernFlag).length;

  // A light progress summary over the most recent entries.
  const latest = workspace.entries[0];
  const recorded = (key: keyof (typeof workspace.entries)[number]) =>
    workspace.entries.filter((e) => e[key] != null && e[key] !== "").length;

  return (
    <PageTransition>
      <LinkButton href="/employer/care-logs" color="inherit" size="small" sx={{ mb: 2 }}>
        ← Back to care oversight
      </LinkButton>

      <Typography variant="h4" gutterBottom>
        {placement.worker.user.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {placement.roleTitle} · started {formatDate(placement.startDate)}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined">
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Progress summary
              </Typography>
              <Stack spacing={1.5}>
                <Summary label="Entries filed" value={String(workspace.entries.length)} />
                <Summary
                  label="Last update"
                  value={latest ? formatDate(latest.loggedFor) : "None yet"}
                />
                <Summary label="Blood pressure readings" value={String(recorded("bloodPressure"))} />
                <Summary label="Medication records" value={String(recorded("medicationsTaken"))} />
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Flagged for attention
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <Chip
                      label={concerns === 0 ? "None" : `${concerns} entr${concerns === 1 ? "y" : "ies"}`}
                      color={concerns === 0 ? "success" : "error"}
                      size="small"
                    />
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <CareLogTimeline
            entries={workspace.entries}
            emptyText={`${placement.worker.user.name} hasn't filed a care log yet. You'll be notified when they do.`}
          />
        </Grid>
      </Grid>
    </PageTransition>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography sx={{ fontWeight: 600 }}>{value}</Typography>
    </Box>
  );
}
