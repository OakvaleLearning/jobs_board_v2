import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { workspacesForWorker } from "@/lib/carelogs";
import CareLogForm from "@/components/carelogs/CareLogForm";
import CareLogTimeline from "@/components/carelogs/CareLogTimeline";
import EmptyState from "@/components/EmptyState";
import { PageTransition } from "@/components/motion";

/**
 * US-4.1 — the caregiver's entry portal. One card per active placement that
 * has care logs enabled, each with the form and that placement's recent
 * entries. Mobile-first: the form collapses to a single column on a phone.
 */
export default async function WorkerCareLogsPage() {
  const user = await requireRole("WORKER");
  const worker = await prisma.workerProfile.findUnique({ where: { userId: user.id } });
  const workspaces = worker ? await workspacesForWorker(worker.id) : [];

  return (
    <PageTransition sx={{ maxWidth: 800 }}>
      <Typography variant="h4" gutterBottom>
        Care logs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Record how the day went. Your sponsor reads these updates from abroad, so a short entry
        after each shift keeps them informed.
      </Typography>

      {workspaces.length === 0 ? (
        <EmptyState
          title="No care logs to fill in"
          description="Care logs appear here when you're placed with a sponsor who manages care remotely."
        />
      ) : (
        <Stack spacing={3}>
          {workspaces.map((w) => (
            <Card key={w.id}>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
                <Typography variant="h6">{w.placement.roleTitle}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
                  Sponsor: {w.placement.employer.orgName ?? w.placement.employer.user.name}
                </Typography>

                <CareLogForm workspaceId={w.id} />

                <Divider sx={{ my: 3 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Your recent entries
                </Typography>
                <CareLogTimeline
                  entries={w.entries}
                  emptyText="You haven't filed an entry for this placement yet."
                />
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
