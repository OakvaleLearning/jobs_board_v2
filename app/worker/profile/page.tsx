import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getWorkerProfileByUserId } from "@/lib/worker";
import { toDateInput } from "@/lib/format";
import { profileStatusMeta, certStatusMeta } from "@/lib/constants";
import CompletionRing from "@/components/CompletionRing";
import StatusBadge from "@/components/StatusBadge";
import { PageTransition } from "@/components/motion";
import ProfileAccordions, { type Section } from "@/components/worker/ProfileAccordions";
import PersonalForm from "@/components/worker/PersonalForm";
import PreferencesForm from "@/components/worker/PreferencesForm";
import EducationSection from "@/components/worker/EducationSection";
import ExperienceSection from "@/components/worker/ExperienceSection";
import DocumentsSection from "@/components/worker/DocumentsSection";
import CertificateSection from "@/components/worker/CertificateSection";
import SubmitProfileCard from "@/components/worker/SubmitProfileCard";

export default async function WorkerProfilePage() {
  const user = await requireRole("WORKER");
  const [profile, categories] = await Promise.all([
    getWorkerProfileByUserId(user.id),
    prisma.workforceCategory.findMany({
      where: { active: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!profile) {
    return <Typography>Profile not found. Please contact support.</Typography>;
  }

  const idDoc = profile.documents.find((d) =>
    ["NIN", "PASSPORT", "VOTER_CARD", "DRIVERS_LICENCE"].includes(d.type),
  );
  const certDoc = profile.documents.find((d) => d.type === "CERTIFICATE") ?? null;

  const sections: Section[] = [
    {
      id: "personal",
      title: "Personal information",
      subtitle: "Your basic details and location",
      complete: !!(profile.dateOfBirth && profile.gender && profile.state && profile.lga && profile.address),
      content: (
        <PersonalForm
          defaults={{
            dateOfBirth: toDateInput(profile.dateOfBirth),
            gender: profile.gender ?? "",
            state: profile.state ?? "",
            lga: profile.lga ?? "",
            address: profile.address ?? "",
          }}
        />
      ),
    },
    {
      id: "preferences",
      title: "Work preferences",
      subtitle: "The care work you do and your expectations",
      complete: !!(
        profile.workforceCategoryId &&
        profile.employmentTypes.length &&
        profile.languages.length &&
        profile.experienceLevel &&
        profile.expectedSalaryMin &&
        profile.personalStatement
      ),
      content: (
        <PreferencesForm
          categories={categories}
          defaults={{
            workforceCategoryId: profile.workforceCategoryId ?? "",
            employmentTypes: profile.employmentTypes,
            languages: profile.languages,
            willingToRelocate: profile.willingToRelocate,
            availabilityDate: toDateInput(profile.availabilityDate),
            experienceLevel: profile.experienceLevel ?? "",
            expectedSalaryMin: profile.expectedSalaryMin?.toString() ?? "",
            expectedSalaryMax: profile.expectedSalaryMax?.toString() ?? "",
            salaryCurrency: profile.salaryCurrency,
            personalStatement: profile.personalStatement ?? "",
          }}
        />
      ),
    },
    {
      id: "education",
      title: "Education",
      subtitle: "Schools and qualifications",
      complete: profile.educations.length > 0,
      content: <EducationSection items={profile.educations} />,
    },
    {
      id: "experience",
      title: "Professional experience",
      subtitle: "Your previous care roles",
      complete: profile.experiences.length > 0,
      content: (
        <ExperienceSection
          items={profile.experiences.map((e) => ({
            id: e.id,
            employer: e.employer,
            roleTitle: e.roleTitle,
            startDate: e.startDate ? e.startDate.toISOString() : null,
            endDate: e.endDate ? e.endDate.toISOString() : null,
            current: e.current,
            description: e.description,
          }))}
        />
      ),
    },
    {
      id: "documents",
      title: "Identity & conduct documents",
      subtitle: "ID, selfie, address, and background documents",
      complete: !!idDoc && profile.documents.some((d) => d.type === "SELFIE"),
      content: (
        <DocumentsSection
          documents={profile.documents.map((d) => ({
            type: d.type,
            fileUrl: d.fileUrl,
            fileName: d.fileName,
            status: d.status,
          }))}
        />
      ),
    },
    {
      id: "certificate",
      title: "Oakvale certificate",
      subtitle: "Upload and verify your certification",
      complete: !!certDoc,
      content: (
        <CertificateSection
          certStatus={profile.certStatus}
          existing={certDoc ? { fileUrl: certDoc.fileUrl, fileName: certDoc.fileName } : null}
          defaults={{
            certificateNumber: profile.certificateNumber ?? "",
            certProgramme: profile.certProgramme ?? "",
            certCompletionDate: toDateInput(profile.certCompletionDate),
          }}
        />
      ),
    },
  ];

  return (
    <PageTransition sx={{ maxWidth: 900, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        My Profile
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Complete each section. Your progress saves as you go.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card>
            <CardContent sx={{ display: "flex", alignItems: "center", gap: 3, p: 3 }}>
              <CompletionRing value={profile.completionPercent} />
              <Box>
                <Typography variant="subtitle1">Profile completion</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Reach 70% to submit for review.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                  <StatusBadge meta={profileStatusMeta[profile.profileStatus]} />
                  <StatusBadge meta={certStatusMeta[profile.certStatus]} />
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <SubmitProfileCard status={profile.profileStatus} completion={profile.completionPercent} />
        </Grid>
      </Grid>

      <ProfileAccordions sections={sections} />
    </PageTransition>
  );
}
