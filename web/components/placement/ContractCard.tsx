"use client";

import { useState, useTransition } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Link from "@mui/material/Link";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import StatusBadge from "@/components/StatusBadge";
import { signContract } from "@/app/contracts-actions";
import { contractTypeLabels, contractStatusMeta } from "@/lib/constants";
import type { ContractType, ContractStatus } from "@/generated/prisma/client";

type Props = {
  contractId: string;
  type: ContractType;
  status: ContractStatus;
  pdfUrl: string | null;
  canSign: boolean;
  signerLabel: string;
};

export default function ContractCard({ contractId, type, status, pdfUrl, canSign, signerLabel }: Props) {
  const [consent, setConsent] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
            <DescriptionRoundedIcon color="primary" />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {contractTypeLabels[type]}
            </Typography>
          </Box>
          <StatusBadge meta={contractStatusMeta[status]} />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Signed by {signerLabel}. Oakvale counter-signs on generation.
        </Typography>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", flexWrap: "wrap" }}>
          {pdfUrl && (
            <Button
              component={Link}
              href={pdfUrl}
              target="_blank"
              rel="noopener"
              size="small"
              variant="outlined"
              startIcon={<DownloadRoundedIcon />}
            >
              Download PDF
            </Button>
          )}
        </Stack>

        {canSign && status === "AWAITING_SIGNATURE" && (
          <Box sx={{ mt: 2, p: 2, bgcolor: "rgba(27,94,32,0.04)", borderRadius: 2 }}>
            <FormControlLabel
              control={<Checkbox checked={consent} onChange={(e) => setConsent(e.target.checked)} />}
              label="I have read and agree to the terms of this agreement."
            />
            <Box>
              <Button
                variant="contained"
                disabled={!consent || pending}
                onClick={() => startTransition(() => signContract(contractId))}
                sx={{ mt: 1 }}
              >
                Sign agreement
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
