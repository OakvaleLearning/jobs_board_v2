"use client";

import { useActionState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Typography from "@mui/material/Typography";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import Checkbox from "@mui/material/Checkbox";
import Switch from "@mui/material/Switch";
import { createJob } from "@/app/employer/jobs/actions";
import { initialFormState } from "@/lib/forms";
import {
  NIGERIAN_STATES,
  employmentTypeLabels,
  currencyLabels,
  CARE_CATEGORY_ORDER,
} from "@/lib/constants";
import SubmitButton from "@/components/SubmitButton";
import type { EmploymentType, Currency } from "@/generated/prisma/client";

const EMPLOYMENT_TYPES: EmploymentType[] = ["FULL_TIME", "PART_TIME", "SHIFT", "LIVE_IN", "CONTRACT"];

type CareType = { id: string; name: string; category: string | null };

const UNCATEGORISED = "Other";

/** Group care types by category, ordered per CARE_CATEGORY_ORDER then A–Z. */
function groupCareTypes(careTypes: CareType[]): [string, CareType[]][] {
  const groups = new Map<string, CareType[]>();
  for (const c of careTypes) {
    const key = c.category?.trim() || UNCATEGORISED;
    (groups.get(key) ?? groups.set(key, []).get(key)!).push(c);
  }
  const order = (name: string) => {
    const i = (CARE_CATEGORY_ORDER as readonly string[]).indexOf(name);
    return i === -1 ? CARE_CATEGORY_ORDER.length + (name === UNCATEGORISED ? 1 : 0) : i;
  };
  return [...groups.entries()].sort(
    ([a], [b]) => order(a) - order(b) || a.localeCompare(b),
  );
}

export default function JobForm({
  categories,
  careTypes,
}: {
  categories: { id: string; name: string }[];
  careTypes: CareType[];
}) {
  const [state, action] = useActionState(createJob, initialFormState);
  const careTypeGroups = groupCareTypes(careTypes);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box component="form" action={action}>
          <Grid container spacing={2.5}>
            {state.message && (
              <Grid size={12}>
                <Alert severity="error">{state.message}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <TextField
                name="title"
                label="Job title"
                placeholder="e.g. Live-in caregiver for elderly parent"
                error={!!state.fieldErrors?.title}
                helperText={state.fieldErrors?.title}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="workforceCategoryId"
                label="Workforce category"
                defaultValue=""
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
              <TextField select name="employmentType" label="Employment type" defaultValue="FULL_TIME">
                {EMPLOYMENT_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {employmentTypeLabels[t]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Employer-side care-type selection, grouped by category (multi-select) */}
            <Grid size={12}>
              <FormControl error={!!state.fieldErrors?.careTypeIds} component="fieldset" variant="standard" sx={{ display: "flex" }}>
                <FormLabel component="legend" sx={{ mb: 1.5 }}>
                  What type of care do you need? Tick all that apply.
                </FormLabel>
                <Stack spacing={2}>
                  {careTypeGroups.map(([category, types]) => (
                    <Box key={category}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.5, mb: 0.5 }}
                      >
                        {category}
                      </Typography>
                      <FormGroup row>
                        {types.map((c) => (
                          <FormControlLabel
                            key={c.id}
                            control={<Checkbox name="careTypeIds" value={c.id} />}
                            label={c.name}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  ))}
                </Stack>
                {state.fieldErrors?.careTypeIds && (
                  <FormHelperText sx={{ mt: 1 }}>{state.fieldErrors.careTypeIds}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select name="state" label="State" defaultValue="">
                <MenuItem value="">
                  <em>Flexible / remote</em>
                </MenuItem>
                {NIGERIAN_STATES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField name="lga" label="LGA / area (optional)" />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select name="salaryCurrency" label="Currency" defaultValue="NGN">
                {(Object.keys(currencyLabels) as Currency[]).map((c) => (
                  <MenuItem key={c} value={c}>
                    {currencyLabels[c]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField name="salaryMin" type="number" label="Salary min (monthly)" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                name="salaryMax"
                type="number"
                label="Salary max"
                error={!!state.fieldErrors?.salaryMax}
                helperText={state.fieldErrors?.salaryMax}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                name="description"
                label="Role description"
                placeholder="Describe the responsibilities, the person you're caring for, hours, and any requirements…"
                multiline
                minRows={5}
                error={!!state.fieldErrors?.description}
                helperText={state.fieldErrors?.description}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="visibility"
                label="Visibility"
                defaultValue="PUBLIC"
                helperText="Public jobs are visible to all workers; restricted jobs are matched by Oakvale."
              >
                <MenuItem value="PUBLIC">Public — searchable by workers</MenuItem>
                <MenuItem value="RESTRICTED">Restricted — Oakvale matches candidates</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
              <FormControlLabel
                control={<Switch name="backgroundCheckRequired" defaultChecked />}
                label="Background check required"
              />
            </Grid>

            <Grid size={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Your post will be reviewed by Oakvale (usually within 1 working day) before it goes live.
              </Typography>
              <SubmitButton size="large">Submit job for review</SubmitButton>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
