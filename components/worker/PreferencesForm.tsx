"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import FormGroup from "@mui/material/FormGroup";
import FormLabel from "@mui/material/FormLabel";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import { savePreferences } from "@/app/worker/actions";
import { initialFormState, keepValue, keepValues } from "@/lib/forms";
import { LANGUAGES, EXPERIENCE_LEVELS, employmentTypeLabels, currencyLabels } from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";
import type { EmploymentType, Currency } from "@/generated/prisma/client";

type Props = {
  categories: { id: string; name: string }[];
  defaults: {
    workforceCategoryId: string;
    employmentTypes: EmploymentType[];
    languages: string[];
    willingToRelocate: boolean;
    availabilityDate: string;
    experienceLevel: string;
    expectedSalaryMin: string;
    expectedSalaryMax: string;
    salaryCurrency: Currency;
    personalStatement: string;
  };
};

const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"];

export default function PreferencesForm({ categories, defaults }: Props) {
  const [state, action] = useActionState(savePreferences, initialFormState);

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
            select
            name="workforceCategoryId"
            label="Type of care work"
            defaultValue={keepValue(state.values, "workforceCategoryId", defaults.workforceCategoryId)}
            error={!!state.fieldErrors?.workforceCategoryId}
            helperText={state.fieldErrors?.workforceCategoryId}
          >
            {categories.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            select
            name="experienceLevel"
            label="Experience level"
            defaultValue={keepValue(state.values, "experienceLevel", defaults.experienceLevel)}
            error={!!state.fieldErrors?.experienceLevel}
            helperText={state.fieldErrors?.experienceLevel}
          >
            {EXPERIENCE_LEVELS.map((l) => (
              <MenuItem key={l} value={l}>
                {l}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid size={12}>
          <FormControl error={!!state.fieldErrors?.employmentTypes} component="fieldset" variant="standard">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Work arrangements you accept
            </FormLabel>
            <FormGroup row>
              {EMPLOYMENT_TYPES.map((t) => (
                <FormControlLabel
                  key={t}
                  control={
                    <Checkbox
                      name="employmentTypes"
                      value={t}
                      defaultChecked={keepValues(
                        state.values,
                        "employmentTypes",
                        defaults.employmentTypes,
                      ).includes(t)}
                    />
                  }
                  label={employmentTypeLabels[t]}
                />
              ))}
            </FormGroup>
            {state.fieldErrors?.employmentTypes && (
              <FormHelperText>{state.fieldErrors.employmentTypes}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={12}>
          <FormControl error={!!state.fieldErrors?.languages} component="fieldset" variant="standard">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Languages spoken
            </FormLabel>
            <FormGroup row>
              {LANGUAGES.map((l) => (
                <FormControlLabel
                  key={l}
                  control={
                    <Checkbox
                      name="languages"
                      value={l}
                      defaultChecked={keepValues(state.values, "languages", defaults.languages).includes(l)}
                    />
                  }
                  label={l}
                />
              ))}
            </FormGroup>
            {state.fieldErrors?.languages && (
              <FormHelperText>{state.fieldErrors.languages}</FormHelperText>
            )}
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            select
            name="salaryCurrency"
            label="Currency"
            defaultValue={keepValue(state.values, "salaryCurrency", defaults.salaryCurrency)}
          >
            {(Object.keys(currencyLabels) as Currency[]).map((c) => (
              <MenuItem key={c} value={c}>
                {currencyLabels[c]}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="expectedSalaryMin"
            type="number"
            label="Expected salary (min, monthly)"
            defaultValue={keepValue(state.values, "expectedSalaryMin", defaults.expectedSalaryMin)}
            error={!!state.fieldErrors?.expectedSalaryMin}
            helperText={state.fieldErrors?.expectedSalaryMin}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <TextField
            name="expectedSalaryMax"
            type="number"
            label="Expected salary (max, optional)"
            defaultValue={keepValue(state.values, "expectedSalaryMax", defaults.expectedSalaryMax)}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            name="availabilityDate"
            type="date"
            label="Available from"
            defaultValue={keepValue(state.values, "availabilityDate", defaults.availabilityDate)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                name="willingToRelocate"
                // On error `state.values` is set: an unchecked switch is absent
                // from the submission, so fall back to unchecked, not the default.
                defaultChecked={
                  state.values
                    ? state.values.willingToRelocate === "on"
                    : defaults.willingToRelocate
                }
              />
            }
            label="I'm willing to relocate"
          />
        </Grid>

        <Grid size={12}>
          <TextField
            name="personalStatement"
            label="Personal statement"
            placeholder="Tell employers about your experience, strengths, and approach to care…"
            multiline
            minRows={4}
            defaultValue={keepValue(state.values, "personalStatement", defaults.personalStatement)}
            error={!!state.fieldErrors?.personalStatement}
            helperText={state.fieldErrors?.personalStatement}
          />
        </Grid>
        <Grid size={12}>
          <SubmitButton>Save preferences</SubmitButton>
        </Grid>
      </Grid>
    </Box>
  );
}
