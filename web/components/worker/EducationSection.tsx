"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { addEducation, removeEducation } from "@/app/worker/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import EmptyState from "@/components/EmptyState";

type Item = {
  id: string;
  institution: string;
  qualification: string;
  startYear: number | null;
  endYear: number | null;
};

export default function EducationSection({ items }: { items: Item[] }) {
  const [state, action] = useActionState(addEducation, initialFormState);

  return (
    <Box>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {items.length === 0 ? (
          <EmptyState title="No education added yet" description="Add your schools and qualifications." />
        ) : (
          items.map((e) => (
            <Box
              key={e.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{e.qualification}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.institution}
                  {e.startYear ? ` · ${e.startYear}${e.endYear ? `–${e.endYear}` : ""}` : ""}
                </Typography>
              </Box>
              <IconButton
                aria-label="Remove"
                onClick={() => removeEducation(e.id)}
                color="error"
                size="small"
              >
                <DeleteOutlineRoundedIcon />
              </IconButton>
            </Box>
          ))
        )}
      </Stack>

      <Box component="form" action={action}>
        <Typography variant="subtitle2" sx={{ mb: 1.5 }}>
          Add education
        </Typography>
        <Grid container spacing={2}>
          {state.message && !state.ok && (
            <Grid size={12}>
              <Alert severity="error">{state.message}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="institution"
              label="School / institution"
              error={!!state.fieldErrors?.institution}
              helperText={state.fieldErrors?.institution}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="qualification"
              label="Qualification"
              error={!!state.fieldErrors?.qualification}
              helperText={state.fieldErrors?.qualification}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField name="startYear" type="number" label="Start year" />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField name="endYear" type="number" label="End year" />
          </Grid>
          <Grid size={12}>
            <SubmitButton variant="outlined">Add education</SubmitButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
