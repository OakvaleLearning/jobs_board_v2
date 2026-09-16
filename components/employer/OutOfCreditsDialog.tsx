"use client";

import { useState, useTransition } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import AddShoppingCartRoundedIcon from "@mui/icons-material/AddShoppingCartRounded";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { buyInterviewCredits } from "@/app/employer/plan-actions";

/**
 * US-3.1 AC2 — shown when a virtual interview is requested on a zero balance.
 * Offers exactly the two documented routes: upgrade to Premium, or buy one
 * standalone credit which lands on the account immediately.
 */
export default function OutOfCreditsDialog({
  open,
  onClose,
  creditPriceLabel,
  onPurchased,
  isPremium,
}: {
  open: boolean;
  onClose: () => void;
  creditPriceLabel: string;
  /** Called after a credit purchase settles, so the caller can retry. */
  onPurchased?: () => void;
  isPremium: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function buyOne() {
    setError(null);
    startTransition(async () => {
      const res = await buyInterviewCredits(1);
      if (res.url) {
        window.location.href = res.url;
        return;
      }
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
      onPurchased?.();
    });
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>You&apos;re out of interview credits</DialogTitle>
      <DialogContent>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Your monthly virtual interview allowance is used up. Your allowance renews at the start of
          your next billing period — or you can continue now:
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          {!isPremium && (
            <Card variant="outlined">
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <WorkspacePremiumRoundedIcon color="primary" />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: 600 }}>Upgrade to Premium Hire</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                      5 virtual interviews every month instead of 1.
                    </Typography>
                    <Button component={Link} href="/employer/plans" variant="contained" size="small">
                      See Premium
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          <Card variant="outlined">
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                <AddShoppingCartRoundedIcon color="primary" />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>Buy one interview credit</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                    {creditPriceLabel} — added to your account as soon as payment clears.
                  </Typography>
                  <Button variant="outlined" size="small" disabled={pending} onClick={buyOne}>
                    {pending ? "Processing…" : `Buy 1 credit — ${creditPriceLabel}`}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
