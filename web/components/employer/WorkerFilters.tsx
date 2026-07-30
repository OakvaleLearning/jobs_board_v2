"use client";

import { useRouter } from "next/navigation";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

export default function WorkerFilters({
  categories,
  states,
  languages,
  values,
}: {
  categories: { id: string; name: string }[];
  states: string[];
  languages: string[];
  values: { category: string; state: string; language: string };
}) {
  const router = useRouter();

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(
      Object.entries({ ...values, [key]: value }).filter(([, v]) => v) as [string, string][],
    );
    router.push(`/employer/workers?${params.toString()}`);
  };

  return (
    <Grid container spacing={2} sx={{ alignItems: "center" }}>
      <Grid size={{ xs: 12, sm: 4 }}>
        <TextField
          select
          size="small"
          label="Category"
          value={values.category}
          onChange={(e) => update("category", e.target.value)}
        >
          <MenuItem value="">All categories</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <TextField
          select
          size="small"
          label="State"
          value={values.state}
          onChange={(e) => update("state", e.target.value)}
        >
          <MenuItem value="">All states</MenuItem>
          {states.map((s) => (
            <MenuItem key={s} value={s}>
              {s}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <TextField
          select
          size="small"
          label="Language"
          value={values.language}
          onChange={(e) => update("language", e.target.value)}
        >
          <MenuItem value="">Any language</MenuItem>
          {languages.map((l) => (
            <MenuItem key={l} value={l}>
              {l}
            </MenuItem>
          ))}
        </TextField>
      </Grid>
      <Grid size={{ xs: 12, sm: 2 }}>
        <Box>
          <Button fullWidth onClick={() => router.push("/employer/workers")}>
            Clear
          </Button>
        </Box>
      </Grid>
    </Grid>
  );
}
