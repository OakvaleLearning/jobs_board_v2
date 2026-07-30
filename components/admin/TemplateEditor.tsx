"use client";

import { useActionState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import { saveTemplate } from "@/app/admin/templates/actions";
import { contractTypeLabels } from "@/lib/constants";
import type { ContractType } from "@/generated/prisma/client";

const VARS = [
  "worker.full_name",
  "worker.role_category",
  "employer.name",
  "employer.contact_name",
  "placement.role_title",
  "placement.start_date",
  "placement.salary",
  "placement.location",
  "pricing.placement_fee",
  "guarantee.window_days",
  "date.today",
];

export default function TemplateEditor({
  type,
  name,
  body,
  version,
}: {
  type: ContractType;
  name: string;
  body: string;
  version: number | null;
}) {
  const [state, action] = useActionState(saveTemplate, initialFormState);

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, flexWrap: "wrap", gap: 1 }}>
          <Typography variant="h6">{contractTypeLabels[type]}</Typography>
          {version ? <Chip label={`v${version} active`} size="small" color="primary" variant="outlined" /> : <Chip label="No template yet" size="small" />}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Use <code>{"{{variable}}"}</code> placeholders — they are filled at signing time. Saving creates a new version.
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 2 }}>
          {VARS.map((v) => (
            <Chip key={v} label={`{{${v}}}`} size="small" variant="outlined" />
          ))}
        </Box>

        <Box component="form" action={action}>
          <input type="hidden" name="type" value={type} />
          <Stack spacing={2}>
            {state.message && <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>}
            <TextField
              name="name"
              label="Template name"
              defaultValue={name}
              size="small"
              error={!!state.fieldErrors?.name}
              helperText={state.fieldErrors?.name}
            />
            <TextField
              name="body"
              label="Template body"
              defaultValue={body}
              multiline
              minRows={10}
              error={!!state.fieldErrors?.body}
              helperText={state.fieldErrors?.body}
              slotProps={{ input: { sx: { fontFamily: "monospace", fontSize: "0.85rem" } } }}
            />
            <Box>
              <SubmitButton variant="contained">Save new version</SubmitButton>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
