"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { saveAccountDetails } from "@/app/account/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";

type Props = {
  defaults: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
};

export default function AccountDetailsForm({ defaults }: Props) {
  const [state, action] = useActionState(saveAccountDetails, initialFormState);

  return (
    <Box component="form" action={action}>
      <Grid container spacing={2.5}>
        {state.message && (
          <Grid size={12}>
            <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="name"
            label="Full name"
            defaultValue={defaults.name}
            error={!!state.fieldErrors?.name}
            helperText={state.fieldErrors?.name}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="phone"
            label="Phone number"
            defaultValue={defaults.phone}
            error={!!state.fieldErrors?.phone}
            helperText={state.fieldErrors?.phone}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            value={defaults.email}
            disabled
            helperText="Email cannot be changed here."
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField label="Role" value={defaults.role} disabled />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Save account details</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
