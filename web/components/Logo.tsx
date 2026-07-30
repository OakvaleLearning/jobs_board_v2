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
      <Box
        sx={{
          width: size + 8,
          height: size + 8,
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background: "linear-gradient(135deg, #2E7D32, #1B5E20)",
          boxShadow: "0 4px 12px rgba(27,94,32,0.35)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <Box
          component="span"
          sx={{
            width: size * 0.42,
            height: size * 0.42,
            borderRadius: "50% 0 50% 50%",
            transform: "rotate(45deg)",
            background: "#C9A227",
          }}
        />
      </Box>
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
