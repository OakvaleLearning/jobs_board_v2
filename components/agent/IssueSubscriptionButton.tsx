"use client";

import { useState, useTransition } from "react";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";
import { issueEmployerSubscription } from "@/app/agent/actions";

export default function IssueSubscriptionButton({ employerId }: { employerId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const issue = () =>
    startTransition(async () => {
      const res = await issueEmployerSubscription(employerId);
      setMessage(res.message ?? null);
    });

  return (
    <Tooltip title={message ?? "Issue the annual partnership subscription invoice"}>
      <span>
        <Button
          size="small"
          variant="outlined"
          onClick={issue}
          disabled={pending}
          startIcon={<ReceiptLongRoundedIcon />}
        >
          {message ? "Issued" : "Issue subscription"}
        </Button>
      </span>
    </Tooltip>
  );
}
