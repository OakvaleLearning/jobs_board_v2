import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/motion";
import { CARE_CATEGORY_ORDER } from "@/lib/constants";
import TaxonomySection from "@/components/admin/TaxonomySection";
import {
  createWorkforceCategory,
  createEmployerType,
  createCareType,
} from "./actions";

export default async function AdminTaxonomyPage() {
  await requireRole("ADMIN");

  const [workforce, employerTypes, careTypes] = await Promise.all([
    prisma.workforceCategory.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.employerType.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
    prisma.careType.findMany({ where: { deletedAt: null }, orderBy: { name: "asc" } }),
  ]);

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Taxonomy
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Configure workforce categories, employer types, and job care types without a code change. New
        entries appear across signup, profiles, and job posting.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <TaxonomySection
            title="Workforce categories"
            description="The types of care work a worker can belong to."
            items={workforce}
            entity="workforceCategory"
            createAction={createWorkforceCategory}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TaxonomySection
            title="Employer types"
            description="Kinds of employer that can register."
            items={employerTypes}
            entity="employerType"
            createAction={createEmployerType}
            withKind
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <TaxonomySection
            title="Care types"
            description="Specializations employers select when posting a job, grouped by category."
            items={careTypes}
            entity="careType"
            createAction={createCareType}
            categoryOptions={CARE_CATEGORY_ORDER}
          />
        </Grid>
      </Grid>
    </PageTransition>
  );
}
