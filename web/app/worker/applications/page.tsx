import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkerProfileByUserId } from "@/lib/worker";
import { applicationStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import InterviewResponse from "@/components/worker/InterviewResponse";
import OfferResponse from "@/components/worker/OfferResponse";
import { PageTransition } from "@/components/motion";

export default async function WorkerApplicationsPage() {
  const user = await requireRole("WORKER");
  const worker = await getWorkerProfileByUserId(user.id);

  const applications = worker
    ? await prisma.application.findMany({
        where: { workerId: worker.id },
        include: {
          job: { include: { employer: { select: { orgName: true } } } },
          interview: true,
          offer: true,
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        My applications
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Track your applications and respond to interview requests and offers.
      </Typography>

      {applications.length === 0 ? (
        <EmptyState
          title="No applications yet"
          description="Browse open jobs and apply to start your journey."
          action={
            <LinkButton href="/worker/jobs" variant="contained">
              Browse jobs
            </LinkButton>
          }
        />
      ) : (
        <Stack spacing={2}>
          {applications.map((a) => (
            <Card key={a.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h6">{a.job.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {a.job.employer.orgName ?? "Private employer"} · applied {formatDate(a.createdAt)}
                    </Typography>
                  </Box>
                  <StatusBadge meta={applicationStatusMeta[a.status]} size="medium" />
                </Box>

                {a.interview && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <InterviewResponse
                      interviewId={a.interview.id}
                      format={a.interview.format}
                      status={a.interview.status}
                      proposedTimes={(a.interview.proposedTimes as string[]) ?? []}
                      confirmedTime={a.interview.confirmedTime ? a.interview.confirmedTime.toISOString() : null}
                    />
                  </>
                )}

                {a.offer && a.offer.status !== "PENDING_ADMIN" && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <OfferResponse
                      offerId={a.offer.id}
                      status={a.offer.status}
                      roleTitle={a.offer.roleTitle}
                      startDate={a.offer.startDate.toISOString()}
                      salary={a.offer.salary}
                      salaryCurrency={a.offer.salaryCurrency}
                      hours={a.offer.hours}
                      location={a.offer.location}
                      conditions={a.offer.conditions}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
