"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { hideReview, unhideReview } from "@/app/review-actions";

/** Agent/admin control to hide (with a reason) or restore a review. */
export default function ModerateReviewButton({
  reviewId,
  hidden,
}: {
  reviewId: string;
  hidden: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, start] = useTransition();

  if (hidden) {
    return (
      <Button size="small" disabled={pending} onClick={() => start(() => unhideReview(reviewId))}>
        Restore
      </Button>
    );
  }

  return (
    <>
      <Button size="small" color="error" onClick={() => setOpen(true)}>
        Hide
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Hide this review?</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Reason (internal)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={pending}
            onClick={() =>
              start(async () => {
                await hideReview(reviewId, reason);
                setOpen(false);
              })
            }
          >
            Hide review
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
