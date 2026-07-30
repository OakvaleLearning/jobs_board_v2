"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { applyToJob } from "@/app/worker/hiring-actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [state, action] = useActionState(applyToJob, initialFormState);

  if (state.ok) {
    return <Alert severity="success">{state.message}</Alert>;
  }

  return (
    <Box component="form" action={action}>
      <input type="hidden" name="jobId" value={jobId} />
      {state.message && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {state.message}
        </Alert>
      )}
      <TextField
        name="coverNote"
        label="Add a note (optional)"
        placeholder="Tell the employer why you're a great fit…"
        multiline
        minRows={3}
        sx={{ mb: 2 }}
      />
      <SubmitButton size="large">Apply for this job</SubmitButton>
    </Box>
  );
}
