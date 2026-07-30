import { notFound } from "next/navigation";
import { requireAgent } from "@/lib/session";
import { getPlacementForUser } from "@/lib/placement";
import PlacementDetailView from "@/components/placement/PlacementDetailView";
import { PageTransition } from "@/components/motion";

export default async function AgentPlacementDetail({ params }: PageProps<"/agent/placements/[id]">) {
  const user = await requireAgent();
  const { id } = await params;
  const placement = await getPlacementForUser(id, user.id, user.role);
  if (!placement) notFound();

  return (
    <PageTransition>
      <PlacementDetailView placement={placement} viewerRole={user.role} viewerUserId={user.id} />
    </PageTransition>
  );
}
