import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { getEmployerProfileByUserId } from "@/lib/employer";
import { PageTransition } from "@/components/motion";
import OnboardingForm from "./OnboardingForm";

export default async function EmployerOnboardingPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);
  const cacDoc = profile?.documents.find((d) => d.type === "CAC") ?? null;

  return (
    <PageTransition sx={{ maxWidth: 760, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        {profile ? "Company profile" : "Welcome — let's set up your account"}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {profile
          ? "Keep your details up to date."
          : "A few details to get you verified and ready to hire."}
      </Typography>

      <OnboardingForm
        defaults={{
          kind: profile?.kind ?? "INDIVIDUAL",
          contactName: profile?.contactName ?? user.name ?? "",
          country: profile?.country ?? "",
          address: profile?.address ?? "",
          orgName: profile?.orgName ?? "",
          sector: profile?.sector ?? "",
          cacNumber: profile?.cacNumber ?? "",
        }}
        verificationStatus={profile?.verificationStatus ?? null}
        cacFileName={cacDoc?.fileName ?? null}
      />
    </PageTransition>
  );
}
