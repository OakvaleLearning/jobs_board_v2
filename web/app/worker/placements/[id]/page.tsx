import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getPlacementForUser } from "@/lib/placement";
import PlacementDetailView from "@/components/placement/PlacementDetailView";
import { PageTransition } from "@/components/motion";

export default async function WorkerPlacementDetail({ params }: PageProps<"/worker/placements/[id]">) {
  const user = await requireRole("WORKER");
  const { id } = await params;
  const placement = await getPlacementForUser(id, user.id, "WORKER");
  if (!placement) notFound();

  return (
    <PageTransition>
      <PlacementDetailView placement={placement} viewerRole="WORKER" viewerUserId={user.id} />
    </PageTransition>
  );
}
