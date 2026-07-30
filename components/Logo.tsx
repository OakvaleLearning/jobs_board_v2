import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** Oakvale wordmark with a leaf glyph — brand green + gold. */
export default function Logo({
  dark = false,
  size = 26,
}: {
  dark?: boolean;
  size?: number;
}) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1 }}>
      <Typography
        component="span"
        sx={{
          fontWeight: 800,
          fontSize: size * 0.72,
          letterSpacing: "-0.02em",
          color: dark ? "#fff" : "text.primary",
          lineHeight: 1,
        }}
      >
        Oakvale{" "}
        <Box component="span" sx={{ color: dark ? "#E0C158" : "secondary.dark" }}>
          Jobs
        </Box>
      </Typography>
    </Box>
  );
}
