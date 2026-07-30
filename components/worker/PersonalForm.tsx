"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { savePersonal } from "@/app/worker/actions";
import { initialFormState } from "@/lib/forms";
import { NIGERIAN_STATES } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";

type Props = {
  defaults: {
    dateOfBirth: string;
    gender: string;
    state: string;
    lga: string;
    address: string;
  };
};

export default function PersonalForm({ defaults }: Props) {
  const [state, action] = useActionState(savePersonal, initialFormState);

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
            name="dateOfBirth"
            type="date"
            label="Date of birth"
            defaultValue={defaults.dateOfBirth}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!state.fieldErrors?.dateOfBirth}
            helperText={state.fieldErrors?.dateOfBirth}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            name="gender"
            label="Gender"
            defaultValue={defaults.gender}
            error={!!state.fieldErrors?.gender}
            helperText={state.fieldErrors?.gender}
          >
            {["Female", "Male", "Other", "Prefer not to say"].map((g) => (
              <MenuItem key={g} value={g}>
                {g}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            name="state"
            label="State"
            defaultValue={defaults.state}
            error={!!state.fieldErrors?.state}
            helperText={state.fieldErrors?.state}
          >
            {NIGERIAN_STATES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="lga"
            label="Local Government Area (LGA)"
            defaultValue={defaults.lga}
            error={!!state.fieldErrors?.lga}
            helperText={state.fieldErrors?.lga}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            name="address"
            label="Home address"
            multiline
            minRows={2}
            defaultValue={defaults.address}
            error={!!state.fieldErrors?.address}
            helperText={state.fieldErrors?.address}
          />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Save personal details</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
