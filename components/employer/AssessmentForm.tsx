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
import { saveAssessment } from "@/app/employer/assessment/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import type { AssessmentField } from "@/lib/assessments";

export default function AssessmentForm({
  title,
  description,
  fields,
  defaults,
}: {
  title: string;
  description: string;
  fields: AssessmentField[];
  defaults: Record<string, string>;
}) {
  const [state, action] = useActionState(saveAssessment, initialFormState);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Typography variant="h5" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>

        <Box component="form" action={action}>
          <Grid container spacing={2.5}>
            {state.message && (
              <Grid size={12}>
                <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
              </Grid>
            )}
            {fields.map((f) => (
              <Grid size={{ xs: 12, sm: f.type === "textarea" ? 12 : 6 }} key={f.name}>
                {f.type === "select" ? (
                  <TextField select name={f.name} label={f.label} defaultValue={defaults[f.name] ?? ""}>
                    <MenuItem value="">—</MenuItem>
                    {f.options.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </TextField>
                ) : (
                  <TextField
                    name={f.name}
                    label={f.label}
                    type={f.type === "number" ? "number" : "text"}
                    multiline={f.type === "textarea"}
                    minRows={f.type === "textarea" ? 2 : undefined}
                    defaultValue={defaults[f.name] ?? ""}
                  />
                )}
              </Grid>
            ))}
            <Grid size={12}>
              <SubmitButton size="large">Save assessment</SubmitButton>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
