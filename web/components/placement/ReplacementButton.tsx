"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import { requestReplacement } from "@/app/placement-actions";

export default function ReplacementButton({ placementId }: { placementId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <Button variant="outlined" color="warning" startIcon={<SwapHorizRoundedIcon />} onClick={() => setOpen(true)}>
        Request replacement
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request a replacement</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Reason"
            placeholder="e.g. Worker left / underperformance / care needs change"
            multiline
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={pending || reason.trim().length < 3}
            onClick={() =>
              startTransition(async () => {
                await requestReplacement(placementId, reason.trim());
                setOpen(false);
              })
            }
          >
            Submit request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
