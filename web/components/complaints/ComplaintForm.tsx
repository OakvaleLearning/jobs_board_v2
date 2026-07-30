"use client";

import { useActionState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { raiseComplaint } from "@/app/complaints-actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import { complaintCategoryLabels } from "@/lib/constants";
import type { ComplaintCategory } from "@/generated/prisma/client";

type PlacementOption = { id: string; label: string };

/** Categories a given role is allowed to raise (brief §9.1). */
const WORKER_CATEGORIES: ComplaintCategory[] = [
  "WORKER_MISCONDUCT_SERIOUS",
  "EMPLOYER_UNFAIR_TREATMENT",
  "EMPLOYER_NON_PAYMENT",
  "PLATFORM_DISPUTE",
  "DATA_PRIVACY",
];
const EMPLOYER_CATEGORIES: ComplaintCategory[] = [
  "WORKER_NON_ATTENDANCE",
  "WORKER_UNDERPERFORMANCE",
  "WORKER_MISCONDUCT_MINOR",
  "WORKER_MISCONDUCT_SERIOUS",
  "PLATFORM_DISPUTE",
  "DATA_PRIVACY",
];

export default function ComplaintForm({
  role,
  placements,
}: {
  role: "worker" | "employer";
  placements: PlacementOption[];
}) {
  const [state, action] = useActionState(raiseComplaint, initialFormState);
  const categories = role === "worker" ? WORKER_CATEGORIES : EMPLOYER_CATEGORIES;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Raise a complaint
        </Typography>
        <Box component="form" action={action}>
          <Grid container spacing={2}>
            {state.message && (
              <Grid size={12}>
                <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
              </Grid>
            )}
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                name="category"
                label="Category"
                defaultValue=""
                error={!!state.fieldErrors?.category}
                helperText={state.fieldErrors?.category}
              >
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {complaintCategoryLabels[c]}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select name="placementId" label="Related placement (optional)" defaultValue="">
                <MenuItem value="">None</MenuItem>
                {placements.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField type="date" name="incidentDate" label="Date of incident" slotProps={{ inputLabel: { shrink: true } }} />
            </Grid>
            <Grid size={12}>
              <TextField
                name="description"
                label="Description"
                multiline
                minRows={4}
                placeholder="Describe what happened (minimum 50 characters)."
                error={!!state.fieldErrors?.description}
                helperText={state.fieldErrors?.description}
              />
            </Grid>
            <Grid size={12}>
              <TextField name="preferredResolution" label="Preferred resolution (optional)" multiline minRows={2} />
            </Grid>
            <Grid size={12}>
              <SubmitButton>Submit complaint</SubmitButton>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
