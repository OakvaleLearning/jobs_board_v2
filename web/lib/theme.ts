"use client";

import { createTheme, alpha } from "@mui/material/styles";

// Oakvale brand: deep green + gold, light theme only (no dark mode).
const OAKVALE_GREEN = "#1B5E20";
const OAKVALE_GREEN_LIGHT = "#2E7D32";
const OAKVALE_GOLD = "#C9A227";

const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: OAKVALE_GREEN,
      light: OAKVALE_GREEN_LIGHT,
      dark: "#0F3D14",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: OAKVALE_GOLD,
      light: "#E0C158",
      dark: "#9C7B12",
      contrastText: "#3A2E00",
    },
    success: { main: "#2E7D32" },
    warning: { main: "#ED6C02" },
    error: { main: "#C62828" },
    info: { main: "#0277BD" },
    background: {
      default: "#F7F9F6",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1A2419",
      secondary: "#586055",
    },
    divider: alpha("#1B5E20", 0.12),
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
    h1: { fontWeight: 800, letterSpacing: "-0.02em" },
    h2: { fontWeight: 800, letterSpacing: "-0.02em" },
    h3: { fontWeight: 700, letterSpacing: "-0.01em" },
    h4: { fontWeight: 700, letterSpacing: "-0.01em" },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    button: { fontWeight: 600, textTransform: "none" },
    subtitle1: { fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 999,
          paddingInline: 20,
          paddingBlock: 8,
          "&.MuiButton-containedPrimary": {
            background: `linear-gradient(135deg, ${OAKVALE_GREEN_LIGHT}, ${OAKVALE_GREEN})`,
            boxShadow: `0 8px 20px ${alpha(OAKVALE_GREEN, 0.28)}`,
            "&:hover": {
              boxShadow: `0 10px 26px ${alpha(OAKVALE_GREEN, 0.36)}`,
            },
          },
        },
        sizeLarge: { paddingInline: 28, paddingBlock: 12, fontSize: "1rem" },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${alpha("#1B5E20", 0.1)}`,
          boxShadow: "0 1px 2px rgba(16,40,16,0.04), 0 8px 24px rgba(16,40,16,0.05)",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: { borderRadius: 16 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 8 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: "outlined", fullWidth: true },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: "inherit" },
      styleOverrides: {
        root: {
          backdropFilter: "saturate(180%) blur(10px)",
          backgroundColor: alpha("#FFFFFF", 0.8),
          borderBottom: `1px solid ${alpha("#1B5E20", 0.1)}`,
        },
      },
    },
  },
});

export default theme;
