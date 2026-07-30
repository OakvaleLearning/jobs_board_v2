import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import StarRating from "@/components/StarRating";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ModerateReviewButton from "@/components/reviews/ModerateReviewButton";
import { PageTransition } from "@/components/motion";
import { reviewDirectionLabels, reviewStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function AgentReviewsPage() {
  await requireAgent();

  const reviews = await prisma.review.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true } },
      subject: { select: { name: true } },
      placement: { select: { id: true, roleTitle: true } },
    },
    take: 200,
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Reviews
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Every review across placements. Hide a review that breaches guidelines; the subject&apos;s
        rating recomputes automatically.
      </Typography>

      {reviews.length === 0 ? (
        <EmptyState title="No reviews yet" description="Reviews appear here once placements are reviewed." />
      ) : (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {reviews.map((r) => (
                <Box key={r.id}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <StarRating value={r.rating} count={1} showCount={false} />
                      <StatusBadge meta={reviewStatusMeta[r.status]} />
                    </Box>
                    <ModerateReviewButton reviewId={r.id} hidden={r.status === "HIDDEN"} />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {reviewDirectionLabels[r.direction]} · {r.author?.name} → {r.subject?.name} ·{" "}
                    <Link href={`/agent/placements/${r.placement.id}`}>{r.placement.roleTitle}</Link> ·{" "}
                    {formatDate(r.createdAt)}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {r.comment}
                  </Typography>
                  {r.hiddenReason && (
                    <Typography variant="caption" color="error">
                      Hidden: {r.hiddenReason}
                    </Typography>
                  )}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}
    </PageTransition>
  );
}
