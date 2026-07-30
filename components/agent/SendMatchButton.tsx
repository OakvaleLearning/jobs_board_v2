"use client";

import { useTransition, useState } from "react";
import Button from "@mui/material/Button";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import { sendShortlistFromMatch } from "@/app/agent/matching-actions";

export default function SendMatchButton({ jobId, workerId }: { jobId: string; workerId: string }) {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  return (
    <Button
      size="small"
      variant={sent ? "outlined" : "contained"}
      disabled={pending || sent}
      startIcon={sent ? <CheckRoundedIcon /> : undefined}
      onClick={() =>
        startTransition(async () => {
          await sendShortlistFromMatch(jobId, workerId);
          setSent(true);
        })
      }
    >
      {sent ? "Sent to shortlist" : "Send to shortlist"}
    </Button>
  );
}
