import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { requireUser, getCurrentDbUser, roleHome } from "@/lib/session";
import { PageTransition } from "@/components/motion";
import LinkButton from "@/components/LinkButton";
import AccountDetailsForm from "@/components/account/AccountDetailsForm";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

const roleLabels: Record<string, string> = {
  WORKER: "Worker",
  EMPLOYER: "Employer",
  AGENT: "Oakvale Agent",
  ADMIN: "Platform Admin",
};

export default async function AccountPage() {
  const user = await requireUser();
  const dbUser = await getCurrentDbUser();

  if (!dbUser) {
    return <Typography>Account not found. Please log in again.</Typography>;
  }

  return (
    <PageTransition sx={{ maxWidth: 720, mx: "auto", p: { xs: 2, sm: 3, md: 4 } }}>
      <LinkButton
        href={roleHome(user.role)}
        startIcon={<ArrowBackRoundedIcon />}
        sx={{ mb: 2 }}
      >
        Back to dashboard
      </LinkButton>
      <Typography variant="h4" gutterBottom>
        Account settings
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Update your personal details and password.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Account details
          </Typography>
          <Box sx={{ mt: 2 }}>
            <AccountDetailsForm
              defaults={{
                name: dbUser.name ?? "",
                phone: dbUser.phone ?? "",
                email: dbUser.email,
                role: roleLabels[dbUser.role] ?? dbUser.role,
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Password
          </Typography>
          <Box sx={{ mt: 2 }}>
            <ChangePasswordForm />
          </Box>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
