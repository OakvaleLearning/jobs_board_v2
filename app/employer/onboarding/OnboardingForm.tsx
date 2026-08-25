"use client";

import { useActionState, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { saveEmployerOnboarding } from "@/app/employer/actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import FileUploadField from "@/components/FileUploadField";
import StatusBadge from "@/components/StatusBadge";
import { verificationStatusMeta, EMPLOYER_SECTORS } from "@/lib/constants";
import type { EmployerKind, VerificationStatus } from "@/generated/prisma/client";

type Props = {
  defaults: {
    kind: EmployerKind;
    contactName: string;
    country: string;
    address: string;
    orgName: string;
    sector: string;
    cacNumber: string;
  };
  verificationStatus: VerificationStatus | null;
  cacFileName: string | null;
};

export default function OnboardingForm({ defaults, verificationStatus, cacFileName }: Props) {
  const [state, action] = useActionState(saveEmployerOnboarding, initialFormState);
  const [kind, setKind] = useState<EmployerKind>(defaults.kind);

  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h5">Company profile</Typography>
          {verificationStatus && <StatusBadge meta={verificationStatusMeta[verificationStatus]} />}
        </Box>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Tell us who you are so Oakvale can verify your account. Individuals and organisations both hire
          verified workers here.
        </Typography>

        <ToggleButtonGroup
          exclusive
          fullWidth
          value={kind}
          onChange={(_, v) => v && setKind(v)}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="INDIVIDUAL" sx={{ py: 1.5, gap: 1 }}>
            <PersonRoundedIcon fontSize="small" /> Individual / Family
          </ToggleButton>
          <ToggleButton value="ORGANIZATION" sx={{ py: 1.5, gap: 1 }}>
            <BusinessRoundedIcon fontSize="small" /> Organization
          </ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" action={action}>
          <input type="hidden" name="kind" value={kind} />
          <Grid container spacing={2.5}>
            {state.message && (
              <Grid size={12}>
                <Alert severity={state.ok ? "success" : "error"}>{state.message}</Alert>
              </Grid>
            )}

            <Collapse in={kind === "ORGANIZATION"} sx={{ width: "100%" }} unmountOnExit>
              <Grid container spacing={2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="orgName"
                    label="Organization name"
                    defaultValue={defaults.orgName}
                    error={!!state.fieldErrors?.orgName}
                    helperText={state.fieldErrors?.orgName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    select
                    name="sector"
                    label="Sector / industry"
                    defaultValue={
                      EMPLOYER_SECTORS.includes(defaults.sector) ? defaults.sector : ""
                    }
                    error={!!state.fieldErrors?.sector}
                    helperText={state.fieldErrors?.sector}
                  >
                    {EMPLOYER_SECTORS.map((s) => (
                      <MenuItem key={s} value={s}>
                        {s}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    name="cacNumber"
                    label="CAC registration number"
                    placeholder="RC1234567"
                    defaultValue={defaults.cacNumber}
                    error={!!state.fieldErrors?.cacNumber}
                    helperText={state.fieldErrors?.cacNumber}
                  />
                </Grid>
                <Grid size={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    CAC document {cacFileName ? "(replace)" : ""}
                  </Typography>
                  <FileUploadField name="cacFile" error={state.fieldErrors?.cacFile} />
                  {cacFileName && (
                    <Typography variant="caption" color="text.secondary">
                      Current: {cacFileName}
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Collapse>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="contactName"
                label="Primary contact name"
                defaultValue={defaults.contactName}
                error={!!state.fieldErrors?.contactName}
                helperText={state.fieldErrors?.contactName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                name="country"
                label="Country"
                placeholder="e.g. Nigeria or United Kingdom"
                defaultValue={defaults.country}
                error={!!state.fieldErrors?.country}
                helperText={state.fieldErrors?.country}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                name="address"
                label="Address"
                multiline
                minRows={2}
                defaultValue={defaults.address}
                error={!!state.fieldErrors?.address}
                helperText={state.fieldErrors?.address}
              />
            </Grid>
            <Grid size={12}>
              <SubmitButton size="large">Save company profile</SubmitButton>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}
