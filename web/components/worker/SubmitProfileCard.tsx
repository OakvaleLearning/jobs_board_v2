"use client";

import { useState, useTransition } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { submitProfileForReview } from "@/app/worker/actions";
import type { ProfileStatus } from "@/generated/prisma/client";

export default function SubmitProfileCard({
  status,
  completion,
}: {
  status: ProfileStatus;
  completion: number;
}) {
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const canSubmit = (status === "DRAFT" || status === "REJECTED") && completion >= 70;

  const submit = () => {
    startTransition(async () => {
      const res = await submitProfileForReview();
      setMsg({ ok: res.ok, text: res.message ?? "" });
    });
  };

  return (
    <Card sx={{ background: "linear-gradient(135deg,#F4F9F2,#fff)" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit for verification
        </Typography>
        {status === "PENDING" ? (
          <Alert severity="info">
            Your profile is with our team for review. We aim to respond within 2 working days.
          </Alert>
        ) : status === "APPROVED" ? (
          <Alert severity="success">Your profile is approved and visible to employers.</Alert>
        ) : status === "SUSPENDED" ? (
          <Alert severity="error">Your account is suspended. Please contact Oakvale support.</Alert>
        ) : (
          <>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Once your profile is at least 70% complete, submit it for Oakvale to review. You&apos;ll be
              able to apply to jobs after your profile and certificate are approved.
            </Typography>
            {msg && (
              <Alert severity={msg.ok ? "success" : "error"} sx={{ mb: 2 }}>
                {msg.text}
              </Alert>
            )}
            <Box>
              <Button
                variant="contained"
                onClick={submit}
                disabled={!canSubmit || pending}
                startIcon={pending ? <CircularProgress size={16} color="inherit" /> : undefined}
              >
                Submit profile for review
              </Button>
              {!canSubmit && completion < 70 && (
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
                  Reach 70% completion to enable submission.
                </Typography>
              )}
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
