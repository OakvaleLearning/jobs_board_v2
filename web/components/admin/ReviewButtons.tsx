"use client";

import { useState, useTransition } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type DecideAction = (id: string, approve: boolean, notes?: string) => Promise<void>;

export default function ReviewButtons({
  id,
  action,
  approveLabel = "Approve",
  rejectLabel = "Reject",
  rejectTitle = "Add a note for the recipient",
  size = "small",
}: {
  id: string;
  action: DecideAction;
  approveLabel?: string;
  rejectLabel?: string;
  rejectTitle?: string;
  size?: "small" | "medium";
}) {
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const approve = () => startTransition(() => action(id, true));
  const reject = () =>
    startTransition(async () => {
      await action(id, false, notes);
      setDialogOpen(false);
      setNotes("");
    });

  return (
    <>
      <Stack direction="row" spacing={1}>
        <Button
          size={size}
          variant="contained"
          color="success"
          onClick={approve}
          disabled={pending}
          startIcon={pending ? <CircularProgress size={14} color="inherit" /> : <CheckRoundedIcon />}
        >
          {approveLabel}
        </Button>
        <Button
          size={size}
          variant="outlined"
          color="error"
          onClick={() => setDialogOpen(true)}
          disabled={pending}
          startIcon={<CloseRoundedIcon />}
        >
          {rejectLabel}
        </Button>
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{rejectTitle}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason / feedback"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={reject} disabled={pending}>
            Confirm {rejectLabel.toLowerCase()}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
