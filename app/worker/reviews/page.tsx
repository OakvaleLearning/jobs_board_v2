import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { requireRole } from "@/lib/session";
import { visibleReviewsForWorker } from "@/lib/reviews";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/reviews/ReviewList";
import { PageTransition } from "@/components/motion";
import { prisma } from "@/lib/prisma";

export default async function WorkerReviewsPage() {
  const user = await requireRole("WORKER");
  const worker = await prisma.workerProfile.findUnique({
    where: { userId: user.id },
    select: { ratingAvg: true, ratingCount: true },
  });
  const reviews = await visibleReviewsForWorker(user.id);

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        My reviews
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Feedback employers have left after your placements. Your rating is shown to prospective
        employers who view your profile.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <StarRating value={worker?.ratingAvg} count={worker?.ratingCount ?? 0} size="large" />
          </Box>
        </CardContent>
      </Card>

      <ReviewList
        reviews={reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          contextLabel: r.placement?.roleTitle ?? null,
        }))}
        emptyText="You have no reviews yet. They appear after an employer reviews a completed placement."
      />
    </PageTransition>
  );
}
