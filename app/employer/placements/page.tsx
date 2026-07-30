import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { listPlacementsForUser } from "@/lib/placement";
import PlacementList from "@/components/placement/PlacementList";
import { PageTransition } from "@/components/motion";

export default async function EmployerPlacementsPage() {
  const user = await requireRole("EMPLOYER");
  const placements = await listPlacementsForUser(user.id, "EMPLOYER");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Placements
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your placed workers, contracts, welfare reports, and CPD status.
      </Typography>
      <PlacementList placements={placements} basePath="/employer/placements" perspective="employer" />
    </PageTransition>
  );
}
