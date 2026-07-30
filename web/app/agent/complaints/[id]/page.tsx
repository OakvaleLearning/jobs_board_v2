import { notFound } from "next/navigation";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StatusBadge from "@/components/StatusBadge";
import ComplaintWorkflow from "@/components/agent/ComplaintWorkflow";
import { PageTransition } from "@/components/motion";
import {
  complaintCategoryLabels,
  complaintStatusMeta,
  complaintUrgencyMeta,
  complaintStageLabels,
} from "@/lib/constants";
import { slaState, slaStateMeta } from "@/lib/complaints";
import { formatDate } from "@/lib/format";

export default async function AgentComplaintDetail({ params }: PageProps<"/agent/complaints/[id]">) {
  await requireAgent();
  const { id } = await params;
  const c = await prisma.complaint.findUnique({
    where: { id },
    include: {
      raisedBy: { select: { name: true, email: true } },
      againstUser: { select: { name: true } },
      assignedAgent: { select: { name: true } },
      placement: { select: { roleTitle: true } },
      events: { orderBy: { createdAt: "asc" }, include: { actor: { select: { name: true } } } },
    },
  });
  if (!c) notFound();

  const sla = slaState(c.slaDueAt, c.status === "CLOSED");

  return (
    <PageTransition>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Box>
          <Typography variant="h4">{c.caseRef}</Typography>
          <Typography color="text.secondary">{complaintCategoryLabels[c.category]}</Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <StatusBadge meta={complaintUrgencyMeta[c.urgency]} size="medium" />
          <StatusBadge meta={slaStateMeta[sla]} size="medium" />
          <StatusBadge meta={complaintStatusMeta[c.status]} size="medium" />
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Case details
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2">
                  <strong>Raised by:</strong> {c.raisedBy.name} ({c.raisedBy.email})
                </Typography>
                {c.againstUser && (
                  <Typography variant="body2">
                    <strong>Against:</strong> {c.againstUser.name}
                  </Typography>
                )}
                {c.placement && (
                  <Typography variant="body2">
                    <strong>Placement:</strong> {c.placement.roleTitle}
                  </Typography>
                )}
                <Typography variant="body2">
                  <strong>Incident date:</strong> {formatDate(c.incidentDate)}
                </Typography>
                <Typography variant="body2">
                  <strong>SLA due:</strong> {formatDate(c.slaDueAt)}
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Typography variant="body2">{c.description}</Typography>
                {c.preferredResolution && (
                  <Typography variant="body2" color="text.secondary">
                    <strong>Preferred resolution:</strong> {c.preferredResolution}
                  </Typography>
                )}
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Case timeline
              </Typography>
              <Stack spacing={2} divider={<Divider flexItem />}>
                {c.events.map((e) => (
                  <Box key={e.id}>
                    <Typography variant="subtitle2">{complaintStageLabels[e.stage]}</Typography>
                    {e.note && <Typography variant="body2">{e.note}</Typography>}
                    <Typography variant="caption" color="text.secondary">
                      {e.actor?.name ?? "System"} · {formatDate(e.createdAt)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Actions
              </Typography>
              <ComplaintWorkflow complaintId={c.id} status={c.status} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
