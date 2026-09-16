"use client";

import { useState, useTransition } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import ConfirmationNumberRoundedIcon from "@mui/icons-material/ConfirmationNumberRounded";
import { useRouter } from "next/navigation";
import { buyInterviewCredits } from "@/app/employer/plan-actions";

const QUANTITIES = [1, 2, 3, 5, 10];

/** Interview credit balance and top-up (US-3.1 AC3). */
export default function BuyCreditsCard({
  balance,
  unitPriceLabel,
  formatTotal,
  unitPrice,
  canBuy,
}: {
  balance: number;
  unitPriceLabel: string;
  /** Formats a total in the account's currency — passed in from the server. */
  formatTotal: string;
  unitPrice: number;
  canBuy: boolean;
}) {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function buy() {
    setError(null);
    startTransition(async () => {
      const res = await buyInterviewCredits(quantity);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  // `formatTotal` carries the currency symbol pattern, e.g. "₦{}".
  const total = formatTotal.replace("{}", (unitPrice * quantity).toLocaleString());

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <ConfirmationNumberRoundedIcon color="primary" />
          <Typography variant="h6">Interview credits</Typography>
        </Box>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
          You have <strong>{balance}</strong> credit{balance === 1 ? "" : "s"}. Each virtual
          interview uses one. Extra credits cost {unitPriceLabel} and never expire.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {canBuy ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>
            <TextField
              select
              size="small"
              label="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              sx={{ minWidth: 120 }}
            >
              {QUANTITIES.map((q) => (
                <MenuItem key={q} value={q}>
                  {q} credit{q === 1 ? "" : "s"}
                </MenuItem>
              ))}
            </TextField>
            <Button variant="contained" disabled={pending} onClick={buy}>
              {pending ? "Processing…" : `Buy for ${total}`}
            </Button>
          </Stack>
        ) : (
          <Alert severity="info">
            Choose a subscription plan before buying add-on interview credits.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
