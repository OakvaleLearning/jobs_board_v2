"use client";

import { useState } from "react";
import TextField, { type TextFieldProps } from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import VisibilityOffRoundedIcon from "@mui/icons-material/VisibilityOffRounded";

// A TextField that renders a password input with a show/hide toggle.
export default function PasswordField({ slotProps, ...props }: Omit<TextFieldProps, "type">) {
  const [show, setShow] = useState(false);

  return (
    <TextField
      {...props}
      type={show ? "text" : "password"}
      slotProps={{
        ...slotProps,
        input: {
          ...slotProps?.input,
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={show ? "Hide password" : "Show password"}
                onClick={() => setShow((v) => !v)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                size="small"
              >
                {show ? (
                  <VisibilityOffRoundedIcon fontSize="small" />
                ) : (
                  <VisibilityRoundedIcon fontSize="small" />
                )}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
