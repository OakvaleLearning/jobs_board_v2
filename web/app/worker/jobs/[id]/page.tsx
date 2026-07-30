import { notFound } from "next/navigation";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkerProfileByUserId, applicationBlockReason } from "@/lib/worker";
import { employmentTypeLabels, formatSalaryRange, applicationStatusMeta } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";
import ApplyForm from "./ApplyForm";

export default async function WorkerJobDetail({ params }: PageProps<"/worker/jobs/[id]">) {
  const user = await requireRole("WORKER");
  const { id } = await params;

  const [job, worker] = await Promise.all([
    prisma.job.findFirst({
      where: { id, status: "APPROVED", visibility: "PUBLIC", deletedAt: null },
      include: {
        employer: { select: { orgName: true, kind: true } },
        workforceCategory: true,
        careTypes: { include: { careType: true } },
      },
    }),
    getWorkerProfileByUserId(user.id),
  ]);
  if (!job) notFound();

  const existing = worker
    ? await prisma.application.findUnique({
        where: { jobId_workerId: { jobId: job.id, workerId: worker.id } },
      })
    : null;

  const block = worker ? applicationBlockReason(worker) : "Complete your profile first.";

  return (
    <PageTransition sx={{ maxWidth: 860, mx: "auto" }}>
      <LinkButton href="/worker/jobs" color="inherit" size="small" sx={{ mb: 2 }}>
        ← Back to jobs
      </LinkButton>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h4" gutterBottom>
                {job.title}
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {job.employer.orgName ?? "Private employer"} · {job.workforceCategory.name}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 2 }}>
                <Chip label={employmentTypeLabels[job.employmentType]} color="primary" />
                <Chip label={[job.lga, job.state].filter(Boolean).join(", ") || "Flexible"} variant="outlined" />
                <Chip label={formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)} variant="outlined" />
                {job.backgroundCheckRequired && <Chip label="Background check required" variant="outlined" />}
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                About this role
              </Typography>
              <Typography sx={{ whiteSpace: "pre-wrap", mb: 2 }}>{job.description}</Typography>

              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Care types
              </Typography>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {job.careTypes.map((c) => (
                  <Chip key={c.careTypeId} label={c.careType.name} size="small" variant="outlined" />
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Apply
              </Typography>
              {existing ? (
                <Stack spacing={1.5}>
                  <Alert severity="success">You&apos;ve applied to this job.</Alert>
                  <Box>
                    <StatusBadge meta={applicationStatusMeta[existing.status]} />
                  </Box>
                  <LinkButton href="/worker/applications" variant="outlined">
                    View my applications
                  </LinkButton>
                </Stack>
              ) : block ? (
                <Alert severity="warning">{block}</Alert>
              ) : (
                <ApplyForm jobId={job.id} />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
