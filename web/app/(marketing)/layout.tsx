import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Logo from "@/components/Logo";
import LinkButton from "@/components/LinkButton";
import { getSessionUser, roleHome } from "@/lib/session";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="sticky">
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            <Link href="/" aria-label="Oakvale Jobs home">
              <Logo />
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              {user ? (
                <LinkButton href={roleHome(user.role)} variant="contained">
                  My dashboard
                </LinkButton>
              ) : (
                <>
                  <LinkButton href="/login" color="inherit">
                    Log in
                  </LinkButton>
                  <LinkButton href="/signup" variant="contained">
                    Get started
                  </LinkButton>
                </>
              )}
            </Stack>
          </Toolbar>
        </Container>
      </AppBar>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      <Box component="footer" sx={{ borderTop: "1px solid", borderColor: "divider", py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
            }}
          >
            <Logo size={20} />
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Oakvale Learning Ltd · jobs.oakvaleltd.com
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
