import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkerProfileByUserId, applicationBlockReason } from "@/lib/worker";
import { applicationStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import CompletionRing from "@/components/CompletionRing";
import StatusBadge from "@/components/StatusBadge";
import LinkButton from "@/components/LinkButton";
import EmptyState from "@/components/EmptyState";
import { PageTransition } from "@/components/motion";

export default async function WorkerDashboard() {
  const user = await requireRole("WORKER");
  const profile = await getWorkerProfileByUserId(user.id);
  if (!profile) return <Typography>Profile not found.</Typography>;

  const applications = await prisma.application.findMany({
    where: { workerId: profile.id },
    include: { job: { include: { employer: true } } },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const blockReason = applicationBlockReason(profile);

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name?.split(" ")[0]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Here&apos;s where your Oakvale journey stands.
      </Typography>

      {blockReason ? (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <AlertTitle>You can&apos;t apply to jobs yet</AlertTitle>
          {blockReason}
        </Alert>
      ) : (
        <Alert severity="success" sx={{ mb: 3 }}>
          <AlertTitle>You&apos;re ready to apply</AlertTitle>
          Your profile and certificate are approved. Browse open jobs and start applying.
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <CompletionRing value={profile.completionPercent} size={120} />
              </Box>
              <Typography variant="h6">Profile completion</Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {profile.completionPercent >= 70
                  ? "Great — your profile meets the threshold."
                  : "Reach 70% to submit for review."}
              </Typography>
              <LinkButton href="/worker/profile" variant="contained" startIcon={<PersonRoundedIcon />}>
                Edit profile
              </LinkButton>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6">Recent applications</Typography>
                <LinkButton href="/worker/jobs" size="small" startIcon={<WorkRoundedIcon />}>
                  Browse jobs
                </LinkButton>
              </Stack>

              {applications.length === 0 ? (
                <EmptyState
                  title="No applications yet"
                  description="When you apply to jobs, they'll appear here."
                />
              ) : (
                <Stack spacing={1.5}>
                  {applications.map((a) => (
                    <Box
                      key={a.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        flexWrap: "wrap",
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                      }}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600 }}>{a.job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {a.job.employer.orgName ?? "Private employer"} · applied {formatDate(a.createdAt)}
                        </Typography>
                      </Box>
                      <StatusBadge meta={applicationStatusMeta[a.status]} />
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
