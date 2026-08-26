import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import AssignManagerButton from "@/components/agent/AssignManagerButton";
import IssueSubscriptionButton from "@/components/agent/IssueSubscriptionButton";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";
import { verificationStatusMeta, assessmentTypeLabels } from "@/lib/constants";

export default async function AgentAccountsPage() {
  const user = await requireAgent();
  const employers = await prisma.employerProfile.findMany({
    where: { deletedAt: null },
    include: {
      user: { select: { name: true, email: true } },
      assignedAgent: { select: { id: true, name: true } },
      assessments: { select: { type: true, submittedAt: true } },
      _count: { select: { placements: true, jobs: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Employer accounts
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Manage the accounts in your portfolio, assessments submitted, and active placements.
      </Typography>

      {employers.length === 0 ? (
        <EmptyState title="No employers yet" description="Employer accounts will appear here." />
      ) : (
        <Stack spacing={2}>
          {employers.map((e) => (
            <Card key={e.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h6">{e.orgName ?? e.user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {e.kind === "ORGANIZATION" ? "Organization" : "Individual / Family"} · {e.user.email} ·{" "}
                      {e._count.placements} placement{e._count.placements === 1 ? "" : "s"} · {e._count.jobs} job
                      {e._count.jobs === 1 ? "" : "s"}
                    </Typography>
                    {e.assessments.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                        Assessments:{" "}
                        {e.assessments
                          .map((a) => `${assessmentTypeLabels[a.type]}${a.submittedAt ? " ✓" : " (draft)"}`)
                          .join(", ")}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                      Account manager: {e.assignedAgent?.name ?? "Unassigned"}
                    </Typography>
                  </Box>
                  <Stack spacing={1} sx={{ alignItems: "flex-end" }}>
                    <StatusBadge meta={verificationStatusMeta[e.verificationStatus]} />
                    <AssignManagerButton
                      employerId={e.id}
                      agentId={user.id}
                      assigned={e.assignedAgent?.id === user.id}
                    />
                    {e.kind === "ORGANIZATION" && e.verificationStatus === "APPROVED" && (
                      <IssueSubscriptionButton employerId={e.id} />
                    )}
                    <LinkButton href={`/agent/accounts/${e.id}`} size="small" variant="outlined">
                      View account
                    </LinkButton>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
