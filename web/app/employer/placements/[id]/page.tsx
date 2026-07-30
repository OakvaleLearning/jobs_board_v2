import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getPlacementForUser } from "@/lib/placement";
import PlacementDetailView from "@/components/placement/PlacementDetailView";
import { PageTransition } from "@/components/motion";

export default async function EmployerPlacementDetail({ params }: PageProps<"/employer/placements/[id]">) {
  const user = await requireRole("EMPLOYER");
  const { id } = await params;
  const placement = await getPlacementForUser(id, user.id, "EMPLOYER");
  if (!placement) notFound();

  return (
    <PageTransition>
      <PlacementDetailView placement={placement} viewerRole="EMPLOYER" viewerUserId={user.id} />
    </PageTransition>
  );
}
