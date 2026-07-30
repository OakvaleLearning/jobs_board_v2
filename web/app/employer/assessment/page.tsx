import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId, employerBlockReason } from "@/lib/employer";
import { assessmentTypeForKind, fieldsForType } from "@/lib/assessments";
import { assessmentTypeLabels } from "@/lib/constants";
import AssessmentForm from "@/components/employer/AssessmentForm";
import { PageTransition } from "@/components/motion";

export default async function EmployerAssessmentPage() {
  const user = await requireRole("EMPLOYER");
  const employer = await getEmployerProfileByUserId(user.id);
  const block = employerBlockReason(employer);

  if (!employer) {
    return (
      <PageTransition>
        <Typography variant="h4" gutterBottom>
          Assessment
        </Typography>
        <Alert severity="info">Complete your company profile first.</Alert>
      </PageTransition>
    );
  }

  // The form shown is driven entirely by live employer data — no hardcoded pipeline copy.
  const type = assessmentTypeForKind(employer.kind);
  const fields = fieldsForType(type);
  const existing = await prisma.assessment.findUnique({
    where: { employerId_type: { employerId: employer.id, type } },
  });
  const defaults = (existing?.data as Record<string, string>) ?? {};

  const orgLabel = employer.orgName ?? employer.contactName ?? user.name;
  const description =
    type === "WORKFORCE_REQUIREMENTS"
      ? `Tell us about ${orgLabel}'s crèche staffing needs${employer.sector ? ` in ${employer.sector}` : ""} so we can match certified childcare workers.`
      : `Tell us about the care needs for your family so your account manager can match a certified caregiver.`;

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        {assessmentTypeLabels[type]}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        This intake form is tailored to your account type ({employer.kind === "ORGANIZATION" ? "Organization" : "Individual / Family"}).
      </Typography>

      {block && <Alert severity="info" sx={{ mb: 3 }}>{block} You can still complete this assessment.</Alert>}

      <AssessmentForm title={assessmentTypeLabels[type]} description={description} fields={fields} defaults={defaults} />
    </PageTransition>
  );
}
