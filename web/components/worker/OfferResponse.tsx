"use client";

import { useTransition } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { respondToOffer } from "@/app/worker/hiring-actions";
import { formatDate } from "@/lib/format";
import { currencySymbols } from "@/lib/constants";
import type { Currency } from "@/generated/prisma/client";

type Props = {
  offerId: string;
  status: string;
  roleTitle: string;
  startDate: string;
  salary: number;
  salaryCurrency: Currency;
  hours: string | null;
  location: string | null;
  conditions: string | null;
};

export default function OfferResponse({
  offerId,
  status,
  roleTitle,
  startDate,
  salary,
  salaryCurrency,
  hours,
  location,
  conditions,
}: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <Box sx={{ p: 2, border: "1px solid", borderColor: "secondary.main", borderRadius: 2, bgcolor: "rgba(201,162,39,0.06)" }}>
      <Typography variant="subtitle1" gutterBottom>
        Job offer: {roleTitle}
      </Typography>
      <Stack spacing={0.5} sx={{ mb: 1.5 }}>
        <Typography variant="body2">
          <strong>Start:</strong> {formatDate(startDate)}
        </Typography>
        <Typography variant="body2">
          <strong>Salary:</strong> {currencySymbols[salaryCurrency]}
          {salary.toLocaleString()} / month
        </Typography>
        {hours && (
          <Typography variant="body2">
            <strong>Hours:</strong> {hours}
          </Typography>
        )}
        {location && (
          <Typography variant="body2">
            <strong>Location:</strong> {location}
          </Typography>
        )}
        {conditions && (
          <Typography variant="body2">
            <strong>Conditions:</strong> {conditions}
          </Typography>
        )}
      </Stack>

      {status === "ACCEPTED" ? (
        <Alert severity="success">You accepted this offer. Your placement is now active.</Alert>
      ) : status === "DECLINED" ? (
        <Alert severity="info">You declined this offer.</Alert>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            disabled={pending}
            onClick={() => startTransition(() => respondToOffer(offerId, "ACCEPTED"))}
          >
            Accept offer
          </Button>
          <Button
            variant="outlined"
            color="error"
            disabled={pending}
            onClick={() => startTransition(() => respondToOffer(offerId, "DECLINED"))}
          >
            Decline
          </Button>
        </Stack>
      )}
    </Box>
  );
}
