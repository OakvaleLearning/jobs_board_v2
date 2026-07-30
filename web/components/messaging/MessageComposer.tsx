"use client";

import { useActionState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { useFormStatus } from "react-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { sendMessage } from "@/app/messages-actions";
import { initialFormState } from "@/lib/forms";

function SendButton() {
  const { pending } = useFormStatus();
  return (
    <IconButton type="submit" color="primary" disabled={pending} aria-label="Send message">
      {pending ? <CircularProgress size={20} /> : <SendRoundedIcon />}
    </IconButton>
  );
}

export default function MessageComposer({ conversationId }: { conversationId: string }) {
  const [state, action] = useActionState(sendMessage, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <Box>
      {state.message && !state.ok && (
        <Alert severity="warning" sx={{ mb: 1 }}>
          {state.message}
        </Alert>
      )}
      <Box
        ref={formRef}
        component="form"
        action={action}
        sx={{ display: "flex", gap: 1, alignItems: "flex-end" }}
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <TextField
          name="body"
          placeholder="Write a message…"
          multiline
          maxRows={4}
          size="small"
          autoComplete="off"
        />
        <SendButton />
      </Box>
    </Box>
  );
}
