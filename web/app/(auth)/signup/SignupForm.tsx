"use client";

import { useActionState, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Collapse from "@mui/material/Collapse";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import { signupAction } from "../actions";
import { initialFormState } from "@/lib/forms";
import { referralSourceLabels } from "@/lib/constants";
import { referralSources } from "@/lib/validation/auth";
import SubmitButton from "@/components/SubmitButton";
import { PageTransition } from "@/components/motion";

export default function SignupForm({ initialRole }: { initialRole: "WORKER" | "EMPLOYER" }) {
  const [state, formAction] = useActionState(signupAction, initialFormState);
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">(initialRole);
  const [referral, setReferral] = useState<string>("");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Create your account
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        It takes a minute. You can complete the rest of your profile afterwards.
      </Typography>

      <ToggleButtonGroup
        exclusive
        fullWidth
        value={role}
        onChange={(_, v) => v && setRole(v)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="WORKER" sx={{ py: 1.5, gap: 1 }}>
          <BadgeRoundedIcon fontSize="small" /> I&apos;m a care worker
        </ToggleButton>
        <ToggleButton value="EMPLOYER" sx={{ py: 1.5, gap: 1 }}>
          <BusinessRoundedIcon fontSize="small" /> I&apos;m hiring
        </ToggleButton>
      </ToggleButtonGroup>

      <Box component="form" action={formAction}>
        <input type="hidden" name="role" value={role} />
        <Stack spacing={2.5}>
          {state.message && <Alert severity="error">{state.message}</Alert>}

          <TextField
            name="name"
            label={role === "EMPLOYER" ? "Your full name" : "Full name"}
            autoComplete="name"
            required
            error={!!state.fieldErrors?.name}
            helperText={state.fieldErrors?.name}
          />
          <TextField
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            error={!!state.fieldErrors?.email}
            helperText={state.fieldErrors?.email}
          />
          <TextField
            name="phone"
            label="Phone number"
            autoComplete="tel"
            placeholder="+234…"
            required
            error={!!state.fieldErrors?.phone}
            helperText={state.fieldErrors?.phone}
          />
          <TextField
            name="password"
            type="password"
            label="Create a password"
            autoComplete="new-password"
            required
            error={!!state.fieldErrors?.password}
            helperText={state.fieldErrors?.password || "At least 8 characters, with a letter and a number."}
          />

          {/* Referral tracking — dropdown with conditional referrer name */}
          <TextField
            select
            name="referralSource"
            label="How did you hear about us?"
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
          >
            <MenuItem value="">
              <em>Prefer not to say</em>
            </MenuItem>
            {referralSources.map((s) => (
              <MenuItem key={s} value={s}>
                {referralSourceLabels[s]}
              </MenuItem>
            ))}
          </TextField>

          <Collapse in={referral === "PERSONAL_REFERRAL"} unmountOnExit>
            <TextField
              name="referrerName"
              label="Who referred you?"
              placeholder="Their full name"
              error={!!state.fieldErrors?.referrerName}
              helperText={state.fieldErrors?.referrerName || "Enter the name of the person who referred you."}
            />
          </Collapse>

          <SubmitButton size="large" fullWidth>
            Create account
          </SubmitButton>
        </Stack>
      </Box>

      <Typography sx={{ mt: 3 }} color="text.secondary">
        Already have an account?{" "}
        <MuiLink component={Link} href="/login" sx={{ fontWeight: 600 }}>
          Log in
        </MuiLink>
      </Typography>
    </PageTransition>
  );
}
