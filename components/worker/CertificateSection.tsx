"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import MuiLink from "@mui/material/Link";
import { uploadWorkerDocument } from "@/app/worker/actions";
import { initialFormState } from "@/lib/forms";
import { certStatusMeta } from "@/lib/constants";
import FileUploadField from "@/components/FileUploadField";
import SubmitButton from "@/components/SubmitButton";
import StatusBadge from "@/components/StatusBadge";
import type { CertStatus } from "@/generated/prisma/client";

type Props = {
  certStatus: CertStatus;
  existing: { fileUrl: string; fileName: string } | null;
  defaults: { certificateNumber: string; certProgramme: string; certCompletionDate: string };
};

export default function CertificateSection({ certStatus, existing, defaults }: Props) {
  const [state, action] = useActionState(uploadWorkerDocument, initialFormState);

  return (
    <Box>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle1">Your Oakvale certificate</Typography>
        <StatusBadge meta={certStatusMeta[certStatus]} />
      </Stack>
      <Alert severity="info" sx={{ mb: 2 }}>
        Upload your Oakvale/CPD certificate. The <strong>certificate number is optional</strong> — the
        uploaded file is what our team verifies against the Oakvale register. You can start applying to
        jobs once your profile and certificate are both approved.
      </Alert>

      {existing && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Current file:{" "}
          <MuiLink href={existing.fileUrl} target="_blank" rel="noopener">
            {existing.fileName}
          </MuiLink>
        </Typography>
      )}

      <Box component="form" action={action}>
        <input type="hidden" name="type" value="CERTIFICATE" />
        <Grid container spacing={2.5}>
          {state.message && (
            <Grid size={12}>
              <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
            </Grid>
          )}
          <Grid size={12}>
            <FileUploadField error={state.fieldErrors?.file} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="certificateNumber"
              label="Certificate number (optional)"
              defaultValue={defaults.certificateNumber}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="certProgramme"
              label="Programme (optional)"
              defaultValue={defaults.certProgramme}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              name="certCompletionDate"
              type="date"
              label="Completion date (optional)"
              defaultValue={defaults.certCompletionDate}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </Grid>
          <Grid size={12}>
            <SubmitButton>{existing ? "Replace certificate" : "Upload certificate"}</SubmitButton>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
