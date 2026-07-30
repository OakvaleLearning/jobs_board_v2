"use client";

import { useActionState, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { uploadWorkerDocument } from "@/app/worker/actions";
import { initialFormState } from "@/lib/forms";
import { verificationStatusMeta } from "@/lib/constants";
import FileUploadField from "@/components/FileUploadField";
import SubmitButton from "@/components/SubmitButton";
import StatusBadge from "@/components/StatusBadge";
import type { DocumentType, VerificationStatus } from "@/generated/prisma/client";

type ExistingDoc = { fileUrl: string; fileName: string; status: VerificationStatus } | null;

export default function DocumentRow({
  type,
  label,
  existing,
}: {
  type: DocumentType;
  label: string;
  existing: ExistingDoc;
}) {
  const [state, action] = useActionState(uploadWorkerDocument, initialFormState);
  const [open, setOpen] = useState(false);

  return (
    <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }} spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
          {existing ? (
            <CheckCircleRoundedIcon color="success" />
          ) : (
            <Box sx={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid", borderColor: "divider" }} />
          )}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 600 }}>{label}</Typography>
            {existing ? (
              <MuiLink href={existing.fileUrl} target="_blank" rel="noopener" variant="body2" noWrap>
                {existing.fileName}
              </MuiLink>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Not uploaded
              </Typography>
            )}
          </Box>
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexShrink: 0 }}>
          {existing && <StatusBadge meta={verificationStatusMeta[existing.status]} />}
          <Button size="small" onClick={() => setOpen((o) => !o)}>
            {existing ? "Replace" : "Upload"}
          </Button>
        </Stack>
      </Stack>

      <Collapse in={open || (!!state.message && !state.ok)} unmountOnExit>
        <Box component="form" action={action} sx={{ mt: 2 }}>
          <input type="hidden" name="type" value={type} />
          {state.message && !state.ok && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {state.message}
            </Alert>
          )}
          <FileUploadField error={state.fieldErrors?.file} />
          <Box sx={{ mt: 2 }}>
            <SubmitButton size="small">Upload {label}</SubmitButton>
          </Box>
        </Box>
      </Collapse>

      {state.ok && state.message && (
        <Alert severity="success" sx={{ mt: 2 }}>
          {state.message}
        </Alert>
      )}
    </Box>
  );
}
