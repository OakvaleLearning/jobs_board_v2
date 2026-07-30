import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { listPlacementsForUser } from "@/lib/placement";
import PlacementList from "@/components/placement/PlacementList";
import { PageTransition } from "@/components/motion";

export default async function WorkerPlacementsPage() {
  const user = await requireRole("WORKER");
  const placements = await listPlacementsForUser(user.id, "WORKER");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        My placements
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your active and past placements, contracts, and CPD status.
      </Typography>
      <PlacementList placements={placements} basePath="/worker/placements" perspective="worker" />
    </PageTransition>
  );
}
