"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Alert from "@mui/material/Alert";
import { respondToInterview } from "@/app/worker/hiring-actions";
import { formatDate } from "@/lib/format";

type Props = {
  interviewId: string;
  format: string;
  status: string;
  proposedTimes: string[];
  confirmedTime: string | null;
};

const FORMAT_LABEL: Record<string, string> = {
  IN_PERSON: "In person",
  VIDEO: "Video call",
  PHONE: "Phone call",
};

export default function InterviewResponse({ interviewId, format, status, proposedTimes, confirmedTime }: Props) {
  const [pending, startTransition] = useTransition();
  const [choice, setChoice] = useState(proposedTimes[0] ?? "");

  if (status === "CONFIRMED") {
    return (
      <Alert severity="success">
        Interview confirmed ({FORMAT_LABEL[format]})
        {confirmedTime ? ` for ${new Date(confirmedTime).toLocaleString()}` : ""}.
      </Alert>
    );
  }
  if (status === "CANCELLED") {
    return <Alert severity="info">You declined this interview.</Alert>;
  }

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Interview requested ({FORMAT_LABEL[format]}) — choose a time:
      </Typography>
      <RadioGroup value={choice} onChange={(e) => setChoice(e.target.value)}>
        {proposedTimes.map((t) => (
          <FormControlLabel
            key={t}
            value={t}
            control={<Radio size="small" />}
            label={new Date(t).toLocaleString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          />
        ))}
      </RadioGroup>
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Button
          variant="contained"
          size="small"
          disabled={pending || !choice}
          onClick={() => startTransition(() => respondToInterview(interviewId, choice))}
        >
          Confirm time
        </Button>
        <Button
          color="error"
          size="small"
          disabled={pending}
          onClick={() => startTransition(() => respondToInterview(interviewId, null, true))}
        >
          Decline
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        Proposed on {formatDate(proposedTimes[0])}
      </Typography>
    </Box>
  );
}
