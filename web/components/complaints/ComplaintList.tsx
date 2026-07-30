import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ReopenButton from "@/components/complaints/ReopenButton";
import { complaintCategoryLabels, complaintStatusMeta, complaintUrgencyMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { Complaint } from "@/generated/prisma/client";

export default function ComplaintList({ complaints }: { complaints: Complaint[] }) {
  if (complaints.length === 0) {
    return <EmptyState title="No complaints" description="You haven't raised any complaints." />;
  }
  return (
    <Stack spacing={2}>
      {complaints.map((c) => (
        <Card key={c.id}>
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {c.caseRef} · {complaintCategoryLabels[c.category]}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Raised {formatDate(c.createdAt)}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {c.description.length > 160 ? `${c.description.slice(0, 160)}…` : c.description}
                </Typography>
                {c.resolutionNotes && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Resolution:</strong> {c.resolutionNotes}
                  </Typography>
                )}
              </Box>
              <Stack spacing={1} sx={{ alignItems: "flex-end" }}>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                  <StatusBadge meta={complaintUrgencyMeta[c.urgency]} />
                  <StatusBadge meta={complaintStatusMeta[c.status]} />
                </Stack>
                {c.status === "CLOSED" && c.reopenDeadline && c.reopenDeadline > new Date() && (
                  <ReopenButton complaintId={c.id} />
                )}
              </Stack>
            </Box>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
