import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Logo from "@/components/Logo";
import LinkButton from "@/components/LinkButton";
import UserMenu from "@/components/shell/UserMenu";
import { getSessionUser, roleHome } from "@/lib/session";
import type { Role } from "@/generated/prisma/client";

const roleLabels: Record<Role, string> = {
  WORKER: "Worker",
  EMPLOYER: "Employer",
  AGENT: "Agent",
  ADMIN: "Admin",
};

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
          <Toolbar disableGutters sx={{ gap: { xs: 1, sm: 2 } }}>
            <Link href="/" aria-label="Oakvale Jobs home">
              <Logo />
            </Link>
            <Box sx={{ flexGrow: 1 }} />
            <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} sx={{ alignItems: "center" }}>
              {user ? (
                <UserMenu
                  userName={user.name ?? "Account"}
                  roleLabel={roleLabels[user.role]}
                  dashboardHref={roleHome(user.role)}
                  image={user.image}
                />
              ) : (
                <>
                  <LinkButton
                    href="/login"
                    color="inherit"
                    sx={{ px: { xs: 1.5, sm: 2.5 }, whiteSpace: "nowrap" }}
                  >
                    Log in
                  </LinkButton>
                  <LinkButton
                    href="/signup"
                    variant="contained"
                    sx={{ px: { xs: 2, sm: 2.5 }, whiteSpace: "nowrap" }}
                  >
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
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 1, sm: 3 }}
              sx={{ alignItems: { xs: "flex-start", sm: "center" } }}
            >
              <Stack direction="row" spacing={2}>
                <Link href="/privacy" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ "&:hover": { textDecoration: "underline" } }}
                  >
                    Privacy Policy
                  </Typography>
                </Link>
                <Link href="/terms" style={{ textDecoration: "none" }}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ "&:hover": { textDecoration: "underline" } }}
                  >
                    Terms &amp; Conditions
                  </Typography>
                </Link>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Oakvale Learning Ltd · jobs.oakvaleltd.com
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
