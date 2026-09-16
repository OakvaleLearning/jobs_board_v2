import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Link from "next/link";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { requireRole } from "@/lib/session";
import { getBillingProfile, canUseCareOversight } from "@/lib/subscription";
import { workspacesForEmployer } from "@/lib/carelogs";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";
import { formatDate } from "@/lib/format";

/** US-4.1 — the sponsor's index of care log workspaces, one per placement. */
export default async function EmployerCareLogsPage() {
  const user = await requireRole("EMPLOYER");
  const employer = await getBillingProfile(user.id);

  if (!canUseCareOversight(employer)) {
    return (
      <PageTransition>
        <Typography variant="h4" gutterBottom>
          Care oversight
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          The Remote Care Oversight Suite — digital care logs and progress reports from the caregiver
          — is included with Diaspora Sponsor plans, for families managing care in Nigeria from
          abroad.
        </Alert>
        <LinkButton href="/employer/plans" variant="contained">
          Compare plans
        </LinkButton>
      </PageTransition>
    );
  }

  const workspaces = await workspacesForEmployer(employer!.id);

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Care oversight
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Daily updates from your caregivers — health readings, medication, meals and activities. You
        also receive these by email as they are filed.
      </Typography>

      {workspaces.length === 0 ? (
        <EmptyState
          title="No care logs yet"
          description="A care log workspace is created automatically when a caregiver you hire starts their placement."
        />
      ) : (
        <Stack spacing={2}>
          {workspaces.map((w) => {
            const latest = w.entries[0];
            return (
              <Card key={w.id}>
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 2,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="h6">{w.placement.worker.user.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {w.placement.roleTitle} · {w._count.entries} entr
                        {w._count.entries === 1 ? "y" : "ies"}
                        {latest ? ` · last update ${formatDate(latest.loggedFor)}` : ""}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      {latest?.concernFlag && (
                        <Chip
                          icon={<WarningAmberRoundedIcon />}
                          label="Needs attention"
                          color="error"
                          size="small"
                        />
                      )}
                      <Button component={Link} href={`/employer/care-logs/${w.id}`} variant="outlined">
                        View care log
                      </Button>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </PageTransition>
  );
}
