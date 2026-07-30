import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import PlaceRoundedIcon from "@mui/icons-material/PlaceRounded";
import PaymentsRoundedIcon from "@mui/icons-material/PaymentsRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkerProfileByUserId, applicationBlockReason } from "@/lib/worker";
import { employmentTypeLabels, formatSalaryRange } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import CardLink from "@/components/CardLink";
import { PageTransition } from "@/components/motion";

export default async function WorkerJobsPage() {
  const user = await requireRole("WORKER");
  const worker = await getWorkerProfileByUserId(user.id);
  const block = worker ? applicationBlockReason(worker) : "Complete your profile first.";

  const jobs = await prisma.job.findMany({
    where: { status: "APPROVED", visibility: "PUBLIC", deletedAt: null },
    include: {
      employer: { select: { orgName: true, kind: true } },
      workforceCategory: { select: { name: true } },
      careTypes: { include: { careType: { select: { name: true } } } },
      applications: worker ? { where: { workerId: worker.id }, select: { id: true } } : false,
    },
    orderBy: { createdAt: "desc" },
    take: 60,
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Browse jobs
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Open roles from verified employers. Apply to the ones that match you.
      </Typography>

      {block && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          {block} You can browse, but you&apos;ll need clearance to apply.
        </Alert>
      )}

      {jobs.length === 0 ? (
        <EmptyState title="No open jobs right now" description="Check back soon — new roles are posted regularly." />
      ) : (
        <Grid container spacing={2.5}>
          {jobs.map((j) => {
            const applied = Array.isArray(j.applications) && j.applications.length > 0;
            return (
              <Grid key={j.id} size={{ xs: 12, md: 6 }}>
                <Card sx={{ height: "100%" }}>
                  <CardLink href={`/worker/jobs/${j.id}`}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Typography variant="h6">{j.title}</Typography>
                        {applied && <Chip label="Applied" color="success" size="small" />}
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        {j.employer.orgName ?? "Private employer"} · {j.workforceCategory.name}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mb: 1.5, flexWrap: "wrap", color: "text.secondary" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PlaceRoundedIcon fontSize="small" />
                          <Typography variant="body2">
                            {[j.lga, j.state].filter(Boolean).join(", ") || "Flexible"}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <PaymentsRoundedIcon fontSize="small" />
                          <Typography variant="body2">
                            {formatSalaryRange(j.salaryMin, j.salaryMax, j.salaryCurrency)}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                        <Chip label={employmentTypeLabels[j.employmentType]} size="small" color="primary" variant="outlined" />
                        {j.careTypes.slice(0, 3).map((c) => (
                          <Chip key={c.careTypeId} label={c.careType.name} size="small" variant="outlined" />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                        Posted {formatDate(j.createdAt)}
                      </Typography>
                    </CardContent>
                  </CardLink>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </PageTransition>
  );
}
