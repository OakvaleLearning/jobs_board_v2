"use client";

import { useActionState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import FormHelperText from "@mui/material/FormHelperText";
import { submitReview } from "@/app/review-actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import StarRating from "@/components/StarRating";

/**
 * "Leave a review" card shown on a placement detail when the caller is eligible.
 * Pre-fills with any existing review (edits upsert).
 */
export default function ReviewForm({
  placementId,
  subjectLabel,
  existing,
}: {
  placementId: string;
  subjectLabel: string;
  existing?: { rating: number; comment: string } | null;
}) {
  const [state, action] = useActionState(submitReview, initialFormState);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          {existing ? "Update your review" : `Review ${subjectLabel}`}
        </Typography>
        <Box component="form" action={action}>
          <input type="hidden" name="placementId" value={placementId} />
          <Stack spacing={2}>
            {state.message && (
              <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
            )}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Overall rating
              </Typography>
              <StarRating
                readOnly={false}
                name="rating"
                size="large"
                defaultValue={existing?.rating ?? 0}
              />
              {state.fieldErrors?.rating && (
                <FormHelperText error>{state.fieldErrors.rating}</FormHelperText>
              )}
            </Box>
            <TextField
              name="comment"
              label="Your review"
              multiline
              minRows={3}
              defaultValue={existing?.comment ?? ""}
              placeholder="Share how the placement went (minimum 20 characters)."
              error={!!state.fieldErrors?.comment}
              helperText={state.fieldErrors?.comment}
            />
            <Box>
              <SubmitButton>{existing ? "Update review" : "Post review"}</SubmitButton>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
