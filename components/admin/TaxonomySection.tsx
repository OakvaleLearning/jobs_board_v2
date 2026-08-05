"use client";

import { useActionState, useTransition } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Switch from "@mui/material/Switch";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import { initialFormState, type FormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import { toggleTaxonomyActive, setCareTypeCategory } from "@/app/admin/taxonomy/actions";

type Item = { id: string; name: string; description: string | null; active: boolean; category?: string | null };
type Entity = "workforceCategory" | "employerType" | "careType";

function ToggleActive({ entity, id, active }: { entity: Entity; id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Switch
      checked={active}
      disabled={pending}
      onChange={(e) => startTransition(() => toggleTaxonomyActive(entity, id, e.target.checked))}
    />
  );
}

function CategorySelect({ id, value, options }: { id: string; value: string | null; options: readonly string[] }) {
  const [pending, startTransition] = useTransition();
  return (
    <TextField
      select
      size="small"
      label="Category"
      value={value ?? ""}
      disabled={pending}
      onChange={(e) => startTransition(() => setCareTypeCategory(id, e.target.value))}
      sx={{ minWidth: 200, mt: 1 }}
    >
      <MenuItem value="">
        <em>Uncategorised</em>
      </MenuItem>
      {options.map((o) => (
        <MenuItem key={o} value={o}>
          {o}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default function TaxonomySection({
  title,
  description,
  items,
  entity,
  createAction,
  withKind = false,
  categoryOptions,
}: {
  title: string;
  description: string;
  items: Item[];
  entity: Entity;
  createAction: (prev: FormState, fd: FormData) => Promise<FormState>;
  withKind?: boolean;
  categoryOptions?: readonly string[];
}) {
  const [state, action] = useActionState(createAction, initialFormState);
  const withCategory = !!categoryOptions;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {description}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          {items.map((it) => (
            <Box
              key={it.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1.5,
                p: 1.5,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                opacity: it.active ? 1 : 0.6,
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600 }}>{it.name}</Typography>
                {it.description && (
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {it.description}
                  </Typography>
                )}
                {withCategory && (
                  <CategorySelect id={it.id} value={it.category ?? null} options={categoryOptions!} />
                )}
              </Box>
              <ToggleActive entity={entity} id={it.id} active={it.active} />
            </Box>
          ))}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Box component="form" action={action}>
          <Stack spacing={2}>
            {state.message && (
              <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
            )}
            <TextField
              name="name"
              label="Name"
              size="small"
              error={!!state.fieldErrors?.name}
              helperText={state.fieldErrors?.name}
            />
            {withKind && (
              <TextField select name="kind" label="Kind" size="small" defaultValue="ORGANIZATION">
                <MenuItem value="INDIVIDUAL">Individual</MenuItem>
                <MenuItem value="ORGANIZATION">Organization</MenuItem>
              </TextField>
            )}
            {withCategory && (
              <TextField select name="category" label="Category" size="small" defaultValue="">
                <MenuItem value="">
                  <em>Uncategorised</em>
                </MenuItem>
                {categoryOptions!.map((o) => (
                  <MenuItem key={o} value={o}>
                    {o}
                  </MenuItem>
                ))}
              </TextField>
            )}
            <TextField name="description" label="Description (optional)" size="small" multiline minRows={2} />
            <Box>
              <SubmitButton variant="outlined" size="small">
                Add
              </SubmitButton>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
