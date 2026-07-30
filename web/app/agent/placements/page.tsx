import Typography from "@mui/material/Typography";
import { requireAgent } from "@/lib/session";
import { listPlacementsForUser } from "@/lib/placement";
import PlacementList from "@/components/placement/PlacementList";
import { PageTransition } from "@/components/motion";

export default async function AgentPlacementsPage() {
  const user = await requireAgent();
  const placements = await listPlacementsForUser(user.id, "AGENT");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Placements
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        All managed placements — log welfare checks, track CPD, and handle replacements.
      </Typography>
      <PlacementList placements={placements} basePath="/agent/placements" perspective="agent" />
    </PageTransition>
  );
}
