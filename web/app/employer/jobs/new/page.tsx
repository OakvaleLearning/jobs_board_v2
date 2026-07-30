import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId, employerBlockReason } from "@/lib/employer";
import { PageTransition } from "@/components/motion";
import LinkButton from "@/components/LinkButton";
import JobForm from "./JobForm";

export default async function NewJobPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);
  const block = employerBlockReason(profile);

  const [categories, careTypes] = await Promise.all([
    prisma.workforceCategory.findMany({
      where: { active: true, deletedAt: null },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.careType.findMany({
      where: { active: true, deletedAt: null },
      select: { id: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <PageTransition sx={{ maxWidth: 820, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Post a job
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Tell us who you need. Workers self-select based on the care types you choose.
      </Typography>

      {block ? (
        <Alert
          severity="info"
          action={
            !profile ? (
              <LinkButton href="/employer/onboarding" color="inherit" size="small">
                Complete profile
              </LinkButton>
            ) : undefined
          }
        >
          {block}
        </Alert>
      ) : (
        <JobForm categories={categories} careTypes={careTypes} />
      )}
    </PageTransition>
  );
}
