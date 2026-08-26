import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import BookmarkRoundedIcon from "@mui/icons-material/BookmarkRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId, employerBlockReason } from "@/lib/employer";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";
import type { ReactNode } from "react";

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 46,
            height: 46,
            borderRadius: 2.5,
            display: "grid",
            placeItems: "center",
            color: "primary.main",
            bgcolor: "rgba(27,94,32,0.08)",
            mb: 1.5,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4">{value}</Typography>
        <Typography color="text.secondary">{label}</Typography>
      </CardContent>
    </Card>
  );
}

export default async function EmployerDashboard() {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);
  const block = employerBlockReason(profile);

  const [activeJobs, applications, shortlists] = profile
    ? await Promise.all([
        prisma.job.count({ where: { employerId: profile.id, status: "APPROVED", deletedAt: null } }),
        prisma.application.count({ where: { job: { employerId: profile.id } } }),
        prisma.shortlist.count({ where: { employerId: profile.id } }),
      ])
    : [0, 0, 0];

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        {profile?.orgName ?? `Welcome, ${user.name?.split(" ")[0]}`}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your hiring at a glance.
      </Typography>

      {block && (
        <Alert
          severity={
            profile?.suspendedAt || profile?.verificationStatus === "REJECTED"
              ? "error"
              : "info"
          }
          sx={{ mb: 3 }}
          action={
            !profile ? (
              <LinkButton href="/employer/onboarding" color="inherit" size="small">
                Complete profile
              </LinkButton>
            ) : undefined
          }
        >
          <AlertTitle>Account not ready to hire</AlertTitle>
          {block}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={<WorkRoundedIcon />} label="Live jobs" value={activeJobs} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={<DescriptionRoundedIcon />} label="Applications received" value={applications} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <StatCard icon={<BookmarkRoundedIcon />} label="Shortlisted workers" value={shortlists} />
        </Grid>
      </Grid>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Quick actions
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 1 }}>
            <LinkButton
              href="/employer/jobs/new"
              variant="contained"
              startIcon={<AddRoundedIcon />}
              disabled={!!block}
            >
              Post a job
            </LinkButton>
            <LinkButton
              href="/employer/workers"
              variant="outlined"
              startIcon={<PeopleAltRoundedIcon />}
              disabled={!!block}
            >
              Find workers
            </LinkButton>
          </Stack>
          {block && (
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
              These unlock once your account is verified.
            </Typography>
          )}
        </CardContent>
      </Card>
    </PageTransition>
  );
}
