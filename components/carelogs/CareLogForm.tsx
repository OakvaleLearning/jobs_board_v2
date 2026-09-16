"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import { submitCareLog } from "@/app/carelog-actions";
import { initialFormState, keepValue } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";

/**
 * US-4.1 — the caregiver's entry portal. Laid out for a phone first: single
 * column on small screens, large touch targets, nothing mandatory beyond the
 * date so an entry is quick to file at the end of a shift.
 */
export default function CareLogForm({ workspaceId }: { workspaceId: string }) {
  const [state, action] = useActionState(submitCareLog, initialFormState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <Box component="form" action={action}>
      <input type="hidden" name="workspaceId" value={workspaceId} />
      <Grid container spacing={2}>
        {state.message && (
          <Grid size={12}>
            <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
          </Grid>
        )}

        <Grid size={12}>
          <TextField
            name="loggedFor"
            type="date"
            label="Date this entry covers"
            defaultValue={keepValue(state.values, "loggedFor", today)}
            slotProps={{ inputLabel: { shrink: true } }}
            error={!!state.fieldErrors?.loggedFor}
            helperText={state.fieldErrors?.loggedFor}
          />
        </Grid>

        <Grid size={12}>
          <Typography variant="subtitle2" color="text.secondary">
            Health readings
          </Typography>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            name="bloodPressure"
            label="Blood pressure"
            placeholder="120/80"
            defaultValue={keepValue(state.values, "bloodPressure")}
            error={!!state.fieldErrors?.bloodPressure}
            helperText={state.fieldErrors?.bloodPressure}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            name="temperature"
            type="number"
            label="Temp (°C)"
            slotProps={{ htmlInput: { step: "0.1", inputMode: "decimal" } }}
            defaultValue={keepValue(state.values, "temperature")}
            error={!!state.fieldErrors?.temperature}
            helperText={state.fieldErrors?.temperature}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            name="pulse"
            type="number"
            label="Pulse (bpm)"
            slotProps={{ htmlInput: { inputMode: "numeric" } }}
            defaultValue={keepValue(state.values, "pulse")}
            error={!!state.fieldErrors?.pulse}
            helperText={state.fieldErrors?.pulse}
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <TextField
            name="weight"
            type="number"
            label="Weight (kg)"
            slotProps={{ htmlInput: { step: "0.1", inputMode: "decimal" } }}
            defaultValue={keepValue(state.values, "weight")}
            error={!!state.fieldErrors?.weight}
            helperText={state.fieldErrors?.weight}
          />
        </Grid>

        <Grid size={12}>
          <Divider sx={{ my: 1 }} />
          <Typography variant="subtitle2" color="text.secondary">
            Medication &amp; daily care
          </Typography>
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            name="medicationsTaken"
            label="Medication given"
            placeholder="e.g. Amlodipine 5mg"
            defaultValue={keepValue(state.values, "medicationsTaken")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="medicationTime"
            label="Time given"
            placeholder="e.g. 8:00am"
            defaultValue={keepValue(state.values, "medicationTime")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            name="meals"
            label="Meals"
            multiline
            minRows={2}
            placeholder="What was eaten, and how much"
            defaultValue={keepValue(state.values, "meals")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8 }}>
          <TextField
            name="activities"
            label="Activities"
            placeholder="e.g. Short walk, physiotherapy exercises"
            defaultValue={keepValue(state.values, "activities")}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="mood"
            label="General mood"
            placeholder="e.g. Cheerful, tired"
            defaultValue={keepValue(state.values, "mood")}
          />
        </Grid>
        <Grid size={12}>
          <TextField
            name="notes"
            label="Notes for the sponsor"
            multiline
            minRows={3}
            defaultValue={keepValue(state.values, "notes")}
            error={!!state.fieldErrors?.notes}
            helperText={state.fieldErrors?.notes}
          />
        </Grid>

        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox name="concernFlag" defaultChecked={!!state.values?.concernFlag} />}
            label="Something here needs the sponsor's attention"
          />
        </Grid>

        <Grid size={12}>
          <SubmitButton size="large" fullWidth>
            Submit care log
          </SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
