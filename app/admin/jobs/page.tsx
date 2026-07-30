import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { jobStatusMeta, employmentTypeLabels, formatSalaryRange } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ReviewButtons from "@/components/admin/ReviewButtons";
import { decideJob } from "@/app/admin/actions";
import { PageTransition } from "@/components/motion";

export default async function AdminJobsPage() {
  await requireRole("ADMIN", "AGENT");
  const jobs = await prisma.job.findMany({
    where: { deletedAt: null },
    include: {
      employer: { include: { user: true } },
      workforceCategory: true,
      careTypes: { include: { careType: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = jobs.filter((j) => j.status === "PENDING_REVIEW");
  const others = jobs.filter((j) => j.status !== "PENDING_REVIEW");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Job posts
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review new job posts for appropriate category, realistic requirements, and no discriminatory
        language before they go live.
      </Typography>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Awaiting review ({pending.length})
      </Typography>
      {pending.length === 0 ? (
        <EmptyState title="No job posts awaiting review" />
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pending.map((j) => (
            <Card key={j.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6">{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {j.employer.orgName ?? j.employer.contactName ?? j.employer.user.name} ·{" "}
                      {j.workforceCategory.name} · {employmentTypeLabels[j.employmentType]}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {[j.lga, j.state].filter(Boolean).join(", ") || "Location flexible"} ·{" "}
                      {formatSalaryRange(j.salaryMin, j.salaryMax, j.salaryCurrency)}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ my: 1.5, flexWrap: "wrap", gap: 1 }}>
                      <Chip label={j.visibility === "PUBLIC" ? "Public" : "Restricted"} size="small" />
                      {j.careTypes.map((c) => (
                        <Chip key={c.careTypeId} label={c.careType.name} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {j.description}
                    </Typography>
                  </Box>
                  <ReviewButtons
                    id={j.id}
                    action={decideJob}
                    approveLabel="Approve & publish"
                    rejectLabel="Request revision"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        All job posts ({others.length})
      </Typography>
      <Stack spacing={1.5}>
        {others.map((j) => (
          <Card key={j.id}>
            <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{j.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {j.employer.orgName ?? j.employer.user.name} · posted {formatDate(j.createdAt)}
                </Typography>
              </Box>
              <StatusBadge meta={jobStatusMeta[j.status]} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
