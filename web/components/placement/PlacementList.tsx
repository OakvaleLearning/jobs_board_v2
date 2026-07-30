import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CardLink from "@/components/CardLink";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { placementStatusMeta, cpdStatusMeta, formatMoney } from "@/lib/constants";
import { cpdStatus, guaranteeDaysLeft } from "@/lib/placement";
import { formatDate } from "@/lib/format";

type Row = {
  id: string;
  roleTitle: string;
  status: keyof typeof placementStatusMeta;
  startDate: Date;
  salary: number | null;
  salaryCurrency: "NGN" | "GBP" | "USD";
  guaranteeWindowEnds: Date | null;
  worker: { user: { name: string }; cpdNextDueAt: Date | null };
  employer: { orgName: string | null; user: { name: string } };
};

export default function PlacementList({
  placements,
  basePath,
  perspective,
}: {
  placements: Row[];
  basePath: string;
  perspective: "worker" | "employer" | "agent";
}) {
  if (placements.length === 0) {
    return (
      <EmptyState
        title="No placements yet"
        description={
          perspective === "worker"
            ? "Once you accept an offer, your placement will appear here."
            : "Placements appear here once an offer is accepted."
        }
      />
    );
  }

  return (
    <Stack spacing={2}>
      {placements.map((p) => {
        const cpd = cpdStatus(p.worker.cpdNextDueAt);
        const daysLeft = guaranteeDaysLeft(p.guaranteeWindowEnds);
        const counterparty =
          perspective === "worker" ? p.employer.orgName ?? p.employer.user.name : p.worker.user.name;
        return (
          <Card key={p.id}>
            <CardLink href={`${basePath}/${p.id}`}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h6">{p.roleTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {counterparty} · started {formatDate(p.startDate)}
                      {p.salary ? ` · ${formatMoney(p.salary, p.salaryCurrency)}/mo` : ""}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
                    <StatusBadge meta={placementStatusMeta[p.status]} />
                    {cpd && <StatusBadge meta={cpdStatusMeta[cpd]} />}
                  </Stack>
                </Box>
                {p.status === "ACTIVE" && daysLeft !== null && daysLeft >= 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                    Replacement guarantee: {daysLeft} day{daysLeft === 1 ? "" : "s"} remaining
                  </Typography>
                )}
              </CardContent>
            </CardLink>
          </Card>
        );
      })}
    </Stack>
  );
}
