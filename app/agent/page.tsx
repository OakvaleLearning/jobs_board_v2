import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CardLink from "@/components/CardLink";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { PageTransition, StaggerContainer, MotionItem } from "@/components/motion";
import { complaintCategoryLabels, complaintUrgencyMeta } from "@/lib/constants";
import { slaState, slaStateMeta } from "@/lib/complaints";
import { formatDate } from "@/lib/format";

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardLink href={href}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: value > 0 ? "primary.main" : "text.secondary" }}>
            {value}
          </Typography>
          <Typography color="text.secondary">{label}</Typography>
        </CardContent>
      </CardLink>
    </Card>
  );
}

export default async function AgentOverviewPage() {
  const user = await requireAgent();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    employersPending,
    workersPending,
    certsPending,
    offersPending,
    contractsAwaiting,
    openComplaints,
    activePlacements,
  ] = await Promise.all([
    prisma.employerProfile.count({ where: { verificationStatus: "PENDING", deletedAt: null } }),
    prisma.workerProfile.count({ where: { profileStatus: "PENDING", deletedAt: null } }),
    prisma.workerProfile.count({ where: { certStatus: "PENDING", deletedAt: null } }),
    prisma.offer.count({ where: { status: "PENDING_ADMIN" } }),
    prisma.contract.count({ where: { status: "AWAITING_SIGNATURE" } }),
    prisma.complaint.findMany({
      where: { status: { notIn: ["CLOSED"] } },
      include: { raisedBy: { select: { name: true } } },
      orderBy: { slaDueAt: "asc" },
      take: 8,
    }),
    prisma.placement.findMany({
      where: { status: "ACTIVE" },
      include: { welfareChecks: { orderBy: { date: "desc" }, take: 1 }, worker: { include: { user: true } } },
    }),
  ]);

  const welfareDue = activePlacements.filter(
    (p) => p.welfareChecks.length === 0 || p.welfareChecks[0].date < thirtyDaysAgo,
  );

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Welcome, {user.name}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your operational queue across verifications, placements, and cases.
      </Typography>

      <StaggerContainer>
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {[
            { label: "Employers to verify", value: employersPending, href: "/admin/employers" },
            { label: "Worker profiles to review", value: workersPending, href: "/admin/workers" },
            { label: "Certificates to cross-check", value: certsPending, href: "/admin/certificates" },
            { label: "Offers to release", value: offersPending, href: "/admin/offers" },
            { label: "Contracts awaiting signature", value: contractsAwaiting, href: "/agent/placements" },
            { label: "Welfare checks due", value: welfareDue.length, href: "/agent/placements" },
          ].map((s) => (
            <Grid size={{ xs: 6, md: 4 }} key={s.label}>
              <MotionItem>
                <StatCard {...s} />
              </MotionItem>
            </Grid>
          ))}
        </Grid>
      </StaggerContainer>

      <Typography variant="h6" gutterBottom>
        Open complaint cases
      </Typography>
      {openComplaints.length === 0 ? (
        <EmptyState title="No open cases" description="All complaint cases are closed." />
      ) : (
        <Stack spacing={1.5}>
          {openComplaints.map((c) => {
            const sla = slaState(c.slaDueAt, false);
            return (
              <Card key={c.id}>
                <CardLink href={`/agent/complaints/${c.id}`}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>
                          {c.caseRef} · {complaintCategoryLabels[c.category]}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Raised by {c.raisedBy.name} · SLA {formatDate(c.slaDueAt)}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1}>
                        <StatusBadge meta={complaintUrgencyMeta[c.urgency]} />
                        <StatusBadge meta={slaStateMeta[sla]} />
                      </Stack>
                    </Box>
                  </CardContent>
                </CardLink>
              </Card>
            );
          })}
        </Stack>
      )}
    </PageTransition>
  );
}
