import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId } from "@/lib/employer";
import { jobStatusMeta, employmentTypeLabels, formatSalaryRange } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";

export default async function EmployerJobsPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);

  const jobs = profile
    ? await prisma.job.findMany({
        where: { employerId: profile.id, deletedAt: null },
        include: {
          workforceCategory: true,
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <PageTransition>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h4">My jobs</Typography>
          <Typography color="text.secondary">Manage your posts and review applicants.</Typography>
        </Box>
        <LinkButton href="/employer/jobs/new" variant="contained" startIcon={<AddRoundedIcon />}>
          Post a job
        </LinkButton>
      </Box>

      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          description="Post your first job to start receiving applications from verified workers."
          action={
            <LinkButton href="/employer/jobs/new" variant="contained" startIcon={<AddRoundedIcon />}>
              Post a job
            </LinkButton>
          }
        />
      ) : (
        <Stack spacing={2}>
          {jobs.map((j) => (
            <Card key={j.id}>
              <CardContent sx={{ p: 3, display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
                    <Typography variant="h6">{j.title}</Typography>
                    <StatusBadge meta={jobStatusMeta[j.status]} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {j.workforceCategory.name} · {employmentTypeLabels[j.employmentType]} ·{" "}
                    {formatSalaryRange(j.salaryMin, j.salaryMax, j.salaryCurrency)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Posted {formatDate(j.createdAt)}
                  </Typography>
                  {j.status === "REJECTED" && j.reviewNotes && (
                    <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                      Revision requested: {j.reviewNotes}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1 }}>
                  <Chip
                    icon={<PeopleAltRoundedIcon />}
                    label={`${j._count.applications} applicant${j._count.applications === 1 ? "" : "s"}`}
                    variant="outlined"
                  />
                  <LinkButton href={`/employer/jobs/${j.id}`} size="small" variant="contained">
                    View applicants
                  </LinkButton>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
