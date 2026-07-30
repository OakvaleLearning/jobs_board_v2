"use client";

import { useTransition } from "react";
import Button from "@mui/material/Button";
import { assignAccountManager } from "@/app/agent/actions";

export default function AssignManagerButton({
  employerId,
  agentId,
  assigned,
}: {
  employerId: string;
  agentId: string;
  assigned: boolean;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      variant={assigned ? "outlined" : "contained"}
      disabled={pending}
      onClick={() => startTransition(() => assignAccountManager(employerId, assigned ? "" : agentId))}
    >
      {assigned ? "Unassign me" : "Assign to me"}
    </Button>
  );
}
