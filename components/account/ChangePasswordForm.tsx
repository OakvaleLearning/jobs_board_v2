"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { changePassword } from "@/app/account/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, initialFormState);

  return (
    <Box component="form" action={action}>
      <Grid container spacing={2.5}>
        {state.message && (
          <Grid size={12}>
            <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
          </Grid>
        )}
        <Grid size={12}>
          <TextField
            name="currentPassword"
            type="password"
            label="Current password"
            autoComplete="current-password"
            error={!!state.fieldErrors?.currentPassword}
            helperText={state.fieldErrors?.currentPassword}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="newPassword"
            type="password"
            label="New password"
            autoComplete="new-password"
            error={!!state.fieldErrors?.newPassword}
            helperText={state.fieldErrors?.newPassword}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="confirmPassword"
            type="password"
            label="Confirm new password"
            autoComplete="new-password"
            error={!!state.fieldErrors?.confirmPassword}
            helperText={state.fieldErrors?.confirmPassword}
          />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Change password</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
