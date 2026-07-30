import { notFound } from "next/navigation";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId } from "@/lib/employer";
import {
  jobStatusMeta,
  applicationStatusMeta,
  employmentTypeLabels,
  formatSalaryRange,
} from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import ApplicantActions from "@/components/employer/ApplicantActions";
import { PageTransition } from "@/components/motion";

export default async function EmployerJobApplicantsPage({ params }: PageProps<"/employer/jobs/[id]">) {
  const user = await requireRole("EMPLOYER");
  const employer = await getEmployerProfileByUserId(user.id);
  const { id } = await params;

  const job = await prisma.job.findFirst({
    where: { id, employerId: employer?.id, deletedAt: null },
    include: {
      workforceCategory: true,
      applications: {
        include: {
          worker: {
            include: {
              user: { select: { name: true } },
              workforceCategory: { select: { name: true } },
              documents: { where: { type: "SELFIE" }, select: { fileUrl: true }, take: 1 },
            },
          },
          interview: true,
          offer: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!job) notFound();

  return (
    <PageTransition>
      <LinkButton href="/employer/jobs" color="inherit" size="small" sx={{ mb: 2 }}>
        ← Back to my jobs
      </LinkButton>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 3 }}>
        <Box>
          <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5, flexWrap: "wrap" }}>
            <Typography variant="h4">{job.title}</Typography>
            <StatusBadge meta={jobStatusMeta[job.status]} size="medium" />
          </Stack>
          <Typography color="text.secondary">
            {job.workforceCategory.name} · {employmentTypeLabels[job.employmentType]} ·{" "}
            {formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)}
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Applicants ({job.applications.length})
      </Typography>

      {job.applications.length === 0 ? (
        <EmptyState
          title="No applicants yet"
          description="When workers apply, they'll appear here for you to shortlist, interview, and hire."
        />
      ) : (
        <Stack spacing={2}>
          {job.applications.map((a) => (
            <Card key={a.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "space-between" }}>
                  <Box sx={{ display: "flex", gap: 2, minWidth: 0 }}>
                    <Avatar
                      src={a.worker.documents[0]?.fileUrl}
                      sx={{ width: 56, height: 56, bgcolor: "primary.main" }}
                    >
                      {a.worker.user.name.slice(0, 1)}
                    </Avatar>
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                        <Typography variant="h6">{a.worker.user.name}</Typography>
                        {a.worker.certStatus === "APPROVED" && (
                          <Chip icon={<VerifiedRoundedIcon />} label="Verified" color="primary" size="small" />
                        )}
                        <StatusBadge meta={applicationStatusMeta[a.status]} />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {a.worker.workforceCategory?.name ?? "Care worker"} ·{" "}
                        {[a.worker.lga, a.worker.state].filter(Boolean).join(", ") || "—"} · applied{" "}
                        {formatDate(a.createdAt)}
                      </Typography>
                      {a.coverNote && (
                        <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                          “{a.coverNote}”
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />
                <ApplicantActions
                  applicationId={a.id}
                  workerProfileId={a.workerId}
                  status={a.status}
                  jobTitle={job.title}
                />

                {a.offer && a.offer.status === "PENDING_ADMIN" && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    Offer submitted — awaiting Oakvale review before the worker sees it.
                  </Typography>
                )}
                {a.offer && a.offer.status === "SENT" && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1.5 }}>
                    Offer released to the worker — awaiting their response.
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
