"use client";

import { useState, useTransition } from "react";
import Button, { type ButtonProps } from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

type Action = (id: string, notes?: string) => Promise<void>;

/** A button that opens a notes dialog, then runs a single (id, notes) action. */
export default function NotesActionButton({
  id,
  action,
  label,
  dialogTitle,
  confirmLabel = "Confirm",
  ...buttonProps
}: {
  id: string;
  action: Action;
  label: string;
  dialogTitle: string;
  confirmLabel?: string;
} & Omit<ButtonProps, "onClick" | "action">) {
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [pending, startTransition] = useTransition();

  const run = () =>
    startTransition(async () => {
      await action(id, notes);
      setOpen(false);
      setNotes("");
    });

  return (
    <>
      <Button onClick={() => setOpen(true)} {...buttonProps}>
        {label}
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Reason / note"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={run}
            disabled={pending}
            startIcon={pending ? <CircularProgress size={14} color="inherit" /> : undefined}
          >
            {confirmLabel}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
