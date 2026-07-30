"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { logWelfareCheck } from "@/app/agent/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import { welfareMethodLabels, wellbeingMeta } from "@/lib/constants";
import type { WelfareMethod, WellbeingStatus } from "@/generated/prisma/client";

export default function WelfareCheckForm({ placementId }: { placementId: string }) {
  const [state, action] = useActionState(logWelfareCheck, initialFormState);

  return (
    <Box component="form" action={action}>
      <input type="hidden" name="placementId" value={placementId} />
      <Grid container spacing={2}>
        {state.message && (
          <Grid size={12}>
            <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
          </Grid>
        )}
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select name="method" label="Method" defaultValue="CALL">
            {(Object.keys(welfareMethodLabels) as WelfareMethod[]).map((m) => (
              <MenuItem key={m} value={m}>
                {welfareMethodLabels[m]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField select name="wellbeing" label="Care recipient wellbeing" defaultValue="GREEN">
            {(Object.keys(wellbeingMeta) as WellbeingStatus[]).map((w) => (
              <MenuItem key={w} value={w}>
                {wellbeingMeta[w].label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={12}>
          <FormControlLabel
            control={<Checkbox name="attendanceConfirmed" defaultChecked />}
            label="Worker attendance confirmed"
          />
        </Grid>
        <Grid size={12}>
          <TextField name="issues" label="Issues flagged (optional)" multiline minRows={2} />
        </Grid>
        <Grid size={12}>
          <TextField name="actionTaken" label="Action taken (optional)" multiline minRows={2} />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Log welfare check &amp; send report</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
