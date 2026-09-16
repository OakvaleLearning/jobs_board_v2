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
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import FormHelperText from "@mui/material/FormHelperText";
import { signupAction } from "../actions";
import { initialFormState } from "@/lib/forms";
import { referralSourceLabels, DIASPORA_COUNTRIES, currencyLabels } from "@/lib/constants";
import { referralSources } from "@/lib/validation/auth";
import { accountTypeDescriptions, currenciesFor } from "@/lib/plans";
import type { AccountType, Currency } from "@/generated/prisma/client";
import SubmitButton from "@/components/SubmitButton";
import PasswordField from "@/components/PasswordField";
import { PageTransition } from "@/components/motion";

export default function SignupForm({ initialRole }: { initialRole: "WORKER" | "EMPLOYER" }) {
  const [state, formAction] = useActionState(signupAction, initialFormState);
  const [role, setRole] = useState<"WORKER" | "EMPLOYER">(initialRole);
  const [referral, setReferral] = useState<string>("");
  // US-1.1 — the hiring-context toggle drives currency and gateway selection.
  const [accountType, setAccountType] = useState<AccountType>("LOCAL_NG");
  const [countryCode, setCountryCode] = useState("");
  const [currency, setCurrency] = useState<Currency>("NGN");

  function chooseAccountType(next: AccountType) {
    setAccountType(next);
    // Reset the currency to the new context's default so an NGN selection can
    // never survive a switch to a diaspora account (or vice versa).
    setCurrency(next === "LOCAL_NG" ? "NGN" : "USD");
    setCountryCode("");
  }

  /** Picking a country pre-selects the currency that country usually pays in. */
  function chooseCountry(code: string) {
    setCountryCode(code);
    const match = DIASPORA_COUNTRIES.find((c) => c.code === code);
    if (match) setCurrency(match.currency);
  }

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

      {/* US-1.1 — required hiring-context toggle for employers. */}
      <Collapse in={role === "EMPLOYER"} unmountOnExit>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            How are you hiring?
          </Typography>
          <ToggleButtonGroup
            exclusive
            fullWidth
            value={accountType}
            onChange={(_, v) => v && chooseAccountType(v as AccountType)}
            sx={{ mb: 1 }}
          >
            <ToggleButton value="LOCAL_NG" sx={{ py: 1.5, gap: 1 }}>
              <HomeRoundedIcon fontSize="small" /> Local employer
            </ToggleButton>
            <ToggleButton value="DIASPORA_GLOBAL" sx={{ py: 1.5, gap: 1 }}>
              <PublicRoundedIcon fontSize="small" /> Diaspora sponsor
            </ToggleButton>
          </ToggleButtonGroup>
          <FormHelperText error={!!state.fieldErrors?.accountType}>
            {state.fieldErrors?.accountType ?? accountTypeDescriptions[accountType]}
          </FormHelperText>
        </Box>
      </Collapse>

      <Box component="form" action={formAction}>
        <input type="hidden" name="role" value={role} />
        {role === "EMPLOYER" && (
          <>
            <input type="hidden" name="accountType" value={accountType} />
            <input type="hidden" name="currency" value={currency} />
            <input type="hidden" name="countryCode" value={accountType === "LOCAL_NG" ? "NG" : countryCode} />
          </>
        )}
        <Stack spacing={2.5}>
          {state.message && <Alert severity="error">{state.message}</Alert>}

          {/* Diaspora sponsors choose where they are sponsoring from and which
              currency Oakvale should bill them in. */}
          <Collapse in={role === "EMPLOYER" && accountType === "DIASPORA_GLOBAL"} unmountOnExit>
            <Stack spacing={2.5}>
              <TextField
                select
                label="Country you are sponsoring from"
                value={countryCode}
                onChange={(e) => chooseCountry(e.target.value)}
                error={!!state.fieldErrors?.countryCode}
                helperText={state.fieldErrors?.countryCode}
              >
                {DIASPORA_COUNTRIES.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Billing currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                error={!!state.fieldErrors?.currency}
                helperText={
                  state.fieldErrors?.currency ??
                  "Subscriptions and interview credits are charged in this currency via Stripe or PayPal."
                }
              >
                {currenciesFor.DIASPORA_GLOBAL.map((c) => (
                  <MenuItem key={c} value={c}>
                    {currencyLabels[c]}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
          </Collapse>

          <Collapse in={role === "EMPLOYER" && accountType === "LOCAL_NG"} unmountOnExit>
            <Alert severity="info">
              Local accounts are billed in Naira (₦) through Paystack.
            </Alert>
          </Collapse>

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
          <PasswordField
            name="password"
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

          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
            By creating an account, you agree to our{" "}
            <MuiLink component={Link} href="/terms" sx={{ fontWeight: 600 }}>
              Terms &amp; Conditions
            </MuiLink>{" "}
            and{" "}
            <MuiLink component={Link} href="/privacy" sx={{ fontWeight: 600 }}>
              Privacy Policy
            </MuiLink>
            .
          </Typography>
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
