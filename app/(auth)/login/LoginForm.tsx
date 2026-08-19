"use client";

import { useActionState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Link from "next/link";
import MuiLink from "@mui/material/Link";
import { loginAction } from "../actions";
import { initialFormState } from "@/lib/forms";
import SubmitButton from "@/components/SubmitButton";
import PasswordField from "@/components/PasswordField";
import { PageTransition } from "@/components/motion";

export default function LoginForm() {
  const [state, formAction] = useActionState(loginAction, initialFormState);

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Welcome back
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Log in to your Oakvale Jobs account.
      </Typography>

      <Box component="form" action={formAction}>
        <Stack spacing={2.5}>
          {state.message && <Alert severity="error">{state.message}</Alert>}
          <TextField
            name="email"
            type="email"
            label="Email address"
            autoComplete="email"
            required
            error={!!state.fieldErrors?.email}
            helperText={state.fieldErrors?.email}
          />
          <PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
            required
            error={!!state.fieldErrors?.password}
            helperText={state.fieldErrors?.password}
          />
          <SubmitButton size="large" fullWidth>
            Log in
          </SubmitButton>
        </Stack>
      </Box>

      <Typography sx={{ mt: 3 }} color="text.secondary">
        New to Oakvale Jobs?{" "}
        <MuiLink component={Link} href="/signup" sx={{ fontWeight: 600 }}>
          Create an account
        </MuiLink>
      </Typography>
    </PageTransition>
  );
}
