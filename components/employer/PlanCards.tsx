"use client";

import { useState, useTransition } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { useRouter } from "next/navigation";
import { subscribeToPlan } from "@/app/employer/plan-actions";
import { formatMoney } from "@/lib/constants";
import type { Currency, PlanTier } from "@/generated/prisma/client";

export type PlanCardModel = {
  tier: PlanTier;
  name: string;
  price: number;
  currency: Currency;
  features: { label: string; included: boolean }[];
  interviewsPerMonth: number;
};

export default function PlanCards({
  plans,
  currentTier,
  active,
  simulated,
}: {
  plans: PlanCardModel[];
  currentTier: PlanTier | null;
  active: boolean;
  simulated: boolean;
}) {
  const [pendingTier, setPendingTier] = useState<PlanTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();

  function choose(tier: PlanTier) {
    setPendingTier(tier);
    startTransition(async () => {
      const res = await subscribeToPlan(tier);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      setPendingTier(null);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <>
      <Grid container spacing={3}>
        {plans.map((plan) => {
          const isCurrent = active && currentTier === plan.tier;
          const highlight = plan.tier === "PREMIUM";
          return (
            <Grid key={plan.tier} size={{ xs: 12, md: 6 }}>
              <Card
                variant={highlight ? "elevation" : "outlined"}
                sx={{
                  height: "100%",
                  borderColor: isCurrent ? "primary.main" : undefined,
                  borderWidth: isCurrent ? 2 : undefined,
                }}
              >
                <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Typography variant="h6">{plan.name}</Typography>
                    {isCurrent && <Chip label="Current plan" color="primary" size="small" />}
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75, mb: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>
                      {formatMoney(plan.price, plan.currency)}
                    </Typography>
                    <Typography color="text.secondary">/ month</Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={1.25} sx={{ mb: 3, flexGrow: 1 }}>
                    {plan.features.map((f) => (
                      <Box key={f.label} sx={{ display: "flex", gap: 1.25, alignItems: "flex-start" }}>
                        {f.included ? (
                          <CheckCircleRoundedIcon fontSize="small" color="primary" />
                        ) : (
                          <LockRoundedIcon fontSize="small" sx={{ color: "text.disabled" }} />
                        )}
                        <Typography
                          variant="body2"
                          color={f.included ? "text.primary" : "text.disabled"}
                        >
                          {f.label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    fullWidth
                    size="large"
                    variant={isCurrent ? "outlined" : "contained"}
                    disabled={pendingTier !== null}
                    onClick={() => choose(plan.tier)}
                  >
                    {pendingTier === plan.tier
                      ? "Starting…"
                      : isCurrent
                        ? "Renew for another month"
                        : simulated
                          ? `Activate ${plan.name} (simulated)`
                          : `Choose ${plan.name}`}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}
