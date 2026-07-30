import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import CardLink from "@/components/CardLink";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { PageTransition } from "@/components/motion";
import { complaintCategoryLabels, complaintStatusMeta, complaintUrgencyMeta } from "@/lib/constants";
import { slaState, slaStateMeta } from "@/lib/complaints";
import { formatDate } from "@/lib/format";

export default async function AgentComplaintsPage() {
  await requireAgent();
  const complaints = await prisma.complaint.findMany({
    include: { raisedBy: { select: { name: true } }, assignedAgent: { select: { name: true } } },
    orderBy: [{ status: "asc" }, { slaDueAt: "asc" }],
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Complaints dashboard
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        All cases with SLA tracking. Triage, investigate, resolve, and close.
      </Typography>

      {complaints.length === 0 ? (
        <EmptyState title="No complaints" description="No complaint cases have been raised." />
      ) : (
        <Stack spacing={1.5}>
          {complaints.map((c) => {
            const sla = slaState(c.slaDueAt, c.status === "CLOSED");
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
                          Raised by {c.raisedBy.name} · {formatDate(c.createdAt)} ·{" "}
                          {c.assignedAgent ? `Handler: ${c.assignedAgent.name}` : "Unassigned"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                        <StatusBadge meta={complaintUrgencyMeta[c.urgency]} />
                        <StatusBadge meta={slaStateMeta[sla]} />
                        <StatusBadge meta={complaintStatusMeta[c.status]} />
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
