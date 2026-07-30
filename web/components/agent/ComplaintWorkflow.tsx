"use client";

import { useActionState, useTransition } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import { takeCase, logInvestigation, resolveCase, closeCase } from "@/app/complaints-actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";

export default function ComplaintWorkflow({ complaintId, status }: { complaintId: string; status: string }) {
  const [pending, startTransition] = useTransition();
  const [invState, invAction] = useActionState(logInvestigation, initialFormState);
  const [resState, resAction] = useActionState(resolveCase, initialFormState);

  const open = status !== "CLOSED";

  return (
    <Stack spacing={2}>
      {status === "SUBMITTED" && (
        <Button variant="contained" disabled={pending} onClick={() => startTransition(() => takeCase(complaintId))}>
          Take case &amp; acknowledge
        </Button>
      )}

      {open && status !== "SUBMITTED" && status !== "RESOLVED" && (
        <Box component="form" action={invAction}>
          <input type="hidden" name="complaintId" value={complaintId} />
          <Typography variant="subtitle2" gutterBottom>
            Investigation note
          </Typography>
          {invState.message && (
            <Alert severity={invState.ok ? "success" : "error"} sx={{ mb: 1 }}>
              {invState.message}
            </Alert>
          )}
          <TextField name="note" label="Add a note" multiline minRows={2} sx={{ mb: 1 }} />
          <Box>
            <SubmitButton variant="outlined" size="small">
              Log note
            </SubmitButton>
          </Box>
        </Box>
      )}

      {open && (status === "INVESTIGATING" || status === "TRIAGED" || status === "REOPENED" || status === "ACKNOWLEDGED") && (
        <Box component="form" action={resAction}>
          <input type="hidden" name="complaintId" value={complaintId} />
          <Typography variant="subtitle2" gutterBottom>
            Resolution
          </Typography>
          {resState.message && (
            <Alert severity={resState.ok ? "success" : "error"} sx={{ mb: 1 }}>
              {resState.message}
            </Alert>
          )}
          <TextField name="resolutionNotes" label="Resolution / outcome" multiline minRows={3} sx={{ mb: 1 }} />
          <Box>
            <SubmitButton variant="contained" size="small">
              Record resolution
            </SubmitButton>
          </Box>
        </Box>
      )}

      {status === "RESOLVED" && (
        <Button variant="contained" color="success" disabled={pending} onClick={() => startTransition(() => closeCase(complaintId))}>
          Close case
        </Button>
      )}
    </Stack>
  );
}
