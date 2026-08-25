"use client";

import { useActionState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import { addExperience, removeExperience } from "@/app/worker/actions";
import { initialFormState, keepValue } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import EmptyState from "@/components/EmptyState";

type Item = {
  id: string;
  employer: string;
  roleTitle: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  description: string | null;
};

function fmt(d: string | null) {
  return d ? new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short" }) : "";
}

export default function ExperienceSection({ items }: { items: Item[] }) {
  const [state, action] = useActionState(addExperience, initialFormState);

  return (
    <Box>
      <Stack spacing={1.5} sx={{ mb: 3 }}>
        {items.length === 0 ? (
          <EmptyState title="No experience added yet" description="Add your previous care roles." />
        ) : (
          items.map((e) => (
            <Box
              key={e.id}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{e.roleTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.employer}
                  {e.startDate ? ` · ${fmt(e.startDate)} – ${e.current ? "Present" : fmt(e.endDate)}` : ""}
                </Typography>
                {e.description && (
                  <Typography variant="body2" sx={{ mt: 0.5 }}>
                    {e.description}
                  </Typography>
                )}
              </Box>
              <IconButton
                aria-label="Remove"
                onClick={() => removeExperience(e.id)}
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
          Add experience
        </Typography>
        <Grid container spacing={2}>
          {state.message && !state.ok && (
            <Grid size={12}>
              <Alert severity="error">{state.message}</Alert>
            </Grid>
          )}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="employer"
              label="Employer / household"
              defaultValue={keepValue(state.values, "employer")}
              error={!!state.fieldErrors?.employer}
              helperText={state.fieldErrors?.employer}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              name="roleTitle"
              label="Role"
              defaultValue={keepValue(state.values, "roleTitle")}
              error={!!state.fieldErrors?.roleTitle}
              helperText={state.fieldErrors?.roleTitle}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              name="startDate"
              type="date"
              label="Start"
              defaultValue={keepValue(state.values, "startDate")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField
              name="endDate"
              type="date"
              label="End"
              defaultValue={keepValue(state.values, "endDate")}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }} sx={{ display: "flex", alignItems: "center" }}>
            <FormControlLabel
              control={<Checkbox name="current" defaultChecked={state.values?.current === "on"} />}
              label="I currently work here"
            />
          </Grid>
          <Grid size={12}>
            <TextField
              name="description"
              label="What did you do? (optional)"
              multiline
              minRows={2}
              defaultValue={keepValue(state.values, "description")}
            />
          </Grid>
          <Grid size={12}>
            <SubmitButton variant="outlined">Add experience</SubmitButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
