"use client";

import { useActionState, useTransition } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { saveBaseWeights, recomputeNow, resetToDefaults } from "@/app/admin/matching/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import { matchFactorLabels, type MatchFactor, type MatchWeights } from "@/lib/constants";

const FACTORS = Object.keys(matchFactorLabels) as MatchFactor[];

export default function MatchingEditor({
  baseWeights,
  learnedWeights,
  effectiveWeights,
  sampleSize,
  lastLearnedAt,
}: {
  baseWeights: MatchWeights;
  learnedWeights: MatchWeights | null;
  effectiveWeights: MatchWeights;
  sampleSize: number;
  lastLearnedAt: string | null;
}) {
  const [state, action] = useActionState(saveBaseWeights, initialFormState);
  const [pending, start] = useTransition();

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Base weights
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              The transparent defaults. Higher = more influence on a candidate&apos;s score.
            </Typography>
            <Box component="form" action={action}>
              <Stack spacing={2}>
                {state.message && (
                  <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
                )}
                <Grid container spacing={2}>
                  {FACTORS.map((f) => (
                    <Grid size={{ xs: 6 }} key={f}>
                      <TextField
                        type="number"
                        name={f}
                        label={matchFactorLabels[f]}
                        defaultValue={baseWeights[f]}
                        error={!!state.fieldErrors?.[f]}
                        helperText={state.fieldErrors?.[f]}
                        slotProps={{ htmlInput: { min: 0, max: 100, step: 1 } }}
                        fullWidth
                      />
                    </Grid>
                  ))}
                </Grid>
                <Stack direction="row" spacing={1.5} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <SubmitButton>Save weights</SubmitButton>
                  <Button
                    type="button"
                    variant="text"
                    color="inherit"
                    disabled={pending}
                    onClick={() => start(() => resetToDefaults())}
                  >
                    Reset to defaults
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <Card sx={{ height: "100%" }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6">Effective (learned) weights</Typography>
              <Button
                size="small"
                variant="outlined"
                disabled={pending}
                onClick={() => start(() => recomputeNow())}
              >
                Recompute now
              </Button>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {sampleSize > 0
                ? `Learned from ${sampleSize} completed placement${sampleSize === 1 ? "" : "s"}${lastLearnedAt ? ` · updated ${lastLearnedAt}` : ""}. Weights are blended toward the base until more outcomes accrue.`
                : "No completed placements yet — the ranker uses the base weights."}
            </Typography>
            <Stack spacing={1}>
              {FACTORS.map((f) => (
                <Box key={f} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2">{matchFactorLabels[f]}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {effectiveWeights[f]}
                    {learnedWeights ? (
                      <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                        (base {baseWeights[f]})
                      </Typography>
                    ) : null}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
