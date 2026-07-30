"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import { reopenCase } from "@/app/complaints-actions";

export default function ReopenButton({ complaintId }: { complaintId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button size="small" variant="outlined" disabled={pending} onClick={() => startTransition(() => reopenCase(complaintId))}>
      Reopen case
    </Button>
  );
}
