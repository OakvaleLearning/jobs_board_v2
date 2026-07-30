import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import StarRating from "@/components/StarRating";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import { reviewStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import type { ReviewStatus } from "@/generated/prisma/client";

export type ReviewListItem = {
  id: string;
  rating: number;
  comment: string;
  createdAt: Date;
  status?: ReviewStatus;
  author?: { name: string; role: string } | null;
  contextLabel?: string | null;
};

/** Read-only list of review cards. Shows a status badge only when asked (staff). */
export default function ReviewList({
  reviews,
  showStatus = false,
  emptyText = "No reviews yet.",
}: {
  reviews: ReviewListItem[];
  showStatus?: boolean;
  emptyText?: string;
}) {
  if (reviews.length === 0) {
    return <EmptyState title="No reviews" description={emptyText} />;
  }
  return (
    <Stack spacing={1.5}>
      {reviews.map((r) => (
        <Card key={r.id} variant="outlined">
          <CardContent sx={{ p: 2.5 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <StarRating value={r.rating} count={1} showCount={false} />
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                {showStatus && r.status && <StatusBadge meta={reviewStatusMeta[r.status]} />}
                <Typography variant="caption" color="text.secondary">
                  {formatDate(r.createdAt)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {r.comment}
            </Typography>
            {(r.author || r.contextLabel) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                {r.author ? `— ${r.author.name}` : ""}
                {r.contextLabel ? ` · ${r.contextLabel}` : ""}
              </Typography>
            )}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
