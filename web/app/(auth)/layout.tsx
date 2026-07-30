import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "next/link";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import HandshakeRoundedIcon from "@mui/icons-material/HandshakeRounded";
import Logo from "@/components/Logo";
import AuthBrandSlider from "@/components/AuthBrandSlider";

const points = [
  { icon: <VerifiedRoundedIcon />, text: "Every worker is Oakvale-certified and admin-verified." },
  { icon: <ShieldRoundedIcon />, text: "ID and conduct documents screened before hiring." },
  { icon: <HandshakeRoundedIcon />, text: "Placements coordinated and supported by our team." },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* Brand panel */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          width: "42%",
          p: 6,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Cross-fading background image slider */}
        <AuthBrandSlider />

        {/* Green gradient overlay keeps text legible over the imagery */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(900px 400px at 20% 0%, rgba(201,162,39,0.32), transparent 60%), linear-gradient(160deg, rgba(27,94,32,0.9), rgba(15,61,20,0.88))",
          }}
        />

        {/* Content sits above the imagery + overlay */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Link href="/">
            <Logo dark />
          </Link>
          <Box>
            <Typography variant="h3" sx={{ mb: 3, maxWidth: 420 }}>
              Care work you can trust — verified end to end.
            </Typography>
            <Stack spacing={2.5}>
              {points.map((p) => (
                <Stack key={p.text} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: "rgba(255,255,255,0.14)",
                      flexShrink: 0,
                    }}
                  >
                    {p.icon}
                  </Box>
                  <Typography sx={{ opacity: 0.92 }}>{p.text}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} Oakvale Learning Ltd
          </Typography>
        </Box>
      </Box>

      {/* Form panel */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, sm: 6 },
        }}
      >
        <Container maxWidth="sm" disableGutters>
          <Box sx={{ display: { md: "none" }, mb: 4 }}>
            <Link href="/">
              <Logo />
            </Link>
          </Box>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
