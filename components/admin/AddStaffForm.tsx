"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { createStaff } from "@/app/admin/staff/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import PasswordField from "@/components/PasswordField";

export default function AddStaffForm() {
  const [state, action] = useActionState(createStaff, initialFormState);

  return (
    // key on ok resets the uncontrolled fields after a successful create.
    <Box component="form" action={action} key={state.ok ? "reset" : "form"}>
      <Grid container spacing={2.5}>
        {state.message && (
          <Grid size={12}>
            <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            name="role"
            label="Role"
            defaultValue="AGENT"
            error={!!state.fieldErrors?.role}
            helperText={state.fieldErrors?.role}
          >
            <MenuItem value="AGENT">Oakvale Agent</MenuItem>
            <MenuItem value="ADMIN">Platform Admin</MenuItem>
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="name"
            label="Full name"
            error={!!state.fieldErrors?.name}
            helperText={state.fieldErrors?.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="email"
            type="email"
            label="Email"
            autoComplete="off"
            error={!!state.fieldErrors?.email}
            helperText={state.fieldErrors?.email}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="phone"
            label="Phone number (optional)"
            error={!!state.fieldErrors?.phone}
            helperText={state.fieldErrors?.phone}
          />
        </Grid>
        <Grid size={12}>
          <PasswordField
            name="password"
            label="Initial password"
            autoComplete="new-password"
            error={!!state.fieldErrors?.password}
            helperText={state.fieldErrors?.password ?? "Share this with the new staff member; they can change it later under Account settings."}
          />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Create staff account</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
