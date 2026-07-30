import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import LinkButton from "@/components/LinkButton";
import Logo from "@/components/Logo";

export default function NotFound() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
        gap: 2,
      }}
    >
      <Logo size={28} />
      <Typography variant="h3" sx={{ mt: 2 }}>
        Page not found
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 420 }}>
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
      </Typography>
      <LinkButton href="/" variant="contained">
        Back to home
      </LinkButton>
    </Box>
  );
}
