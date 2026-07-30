"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import { markCpdComplete } from "@/app/agent/actions";

export default function MarkCpdButton({ placementId, workerId }: { placementId: string; workerId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant="outlined"
      startIcon={<VerifiedRoundedIcon />}
      disabled={pending}
      onClick={() => startTransition(() => markCpdComplete(placementId, workerId))}
    >
      Record CPD refresh
    </Button>
  );
}
