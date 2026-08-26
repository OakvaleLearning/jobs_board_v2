"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import BlockRoundedIcon from "@mui/icons-material/BlockRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import { suspendEmployer, unsuspendEmployer } from "@/app/admin/actions";

export default function SuspendEmployerButton({
  id,
  suspended,
  size = "small",
}: {
  id: string;
  suspended: boolean;
  size?: "small" | "medium";
}) {
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const confirmSuspend = () =>
    startTransition(async () => {
      await suspendEmployer(id, notes);
      setDialogOpen(false);
      setNotes("");
    });

  const unsuspend = () => startTransition(() => unsuspendEmployer(id));

  if (suspended) {
    return (
      <Button
        size={size}
        variant="outlined"
        color="success"
        onClick={unsuspend}
        disabled={pending}
        startIcon={<RestartAltRoundedIcon />}
      >
        Reinstate
      </Button>
    );
  }

  return (
    <>
      <Button
        size={size}
        variant="outlined"
        color="warning"
        onClick={() => setDialogOpen(true)}
        disabled={pending}
        startIcon={<BlockRoundedIcon />}
      >
        Suspend
      </Button>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Suspend employer account</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The employer will be blocked from posting jobs and searching workers until reinstated.
            They&apos;ll be notified with the reason below.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason (sent to the employer)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button color="warning" variant="contained" onClick={confirmSuspend} disabled={pending}>
            Confirm suspension
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
