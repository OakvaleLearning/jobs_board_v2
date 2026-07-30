import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId, employerBlockReason } from "@/lib/employer";
import { NIGERIAN_STATES, LANGUAGES } from "@/lib/constants";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import WorkerCard from "@/components/employer/WorkerCard";
import WorkerFilters from "@/components/employer/WorkerFilters";
import { PageTransition } from "@/components/motion";
import type { Prisma } from "@/generated/prisma/client";

export default async function EmployerWorkersPage({ searchParams }: PageProps<"/employer/workers">) {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);
  const block = employerBlockReason(profile);

  const sp = await searchParams;
  const q = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : "");
  const categoryId = q("category");
  const state = q("state");
  const language = q("language");

  const categories = await prisma.workforceCategory.findMany({
    where: { active: true, deletedAt: null },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  let workers: {
    id: string;
    name: string;
    photoUrl: string | null;
    category: string | null;
    state: string | null;
    lga: string | null;
    experienceLevel: string | null;
    languages: string[];
    certified: boolean;
    backgroundClear: boolean;
    shortlisted: boolean;
  }[] = [];

  if (!block && profile) {
    const where: Prisma.WorkerProfileWhereInput = {
      searchable: true,
      deletedAt: null,
      ...(categoryId ? { workforceCategoryId: categoryId } : {}),
      ...(state ? { state } : {}),
      ...(language ? { languages: { has: language } } : {}),
    };

    const [rows, shortlisted] = await Promise.all([
      prisma.workerProfile.findMany({
        where,
        include: {
          user: { select: { name: true } },
          workforceCategory: { select: { name: true } },
          documents: { where: { type: "SELFIE" }, select: { fileUrl: true }, take: 1 },
        },
        orderBy: { updatedAt: "desc" },
        take: 60,
      }),
      prisma.shortlist.findMany({
        where: { employerId: profile.id, jobId: null },
        select: { workerId: true },
      }),
    ]);
    const shortlistedIds = new Set(shortlisted.map((s) => s.workerId));

    // Contact details (phone/email/address) are intentionally NOT included here —
    // they are only released to the employer at the point of hire.
    workers = rows.map((w) => ({
      id: w.id,
      name: w.user.name,
      photoUrl: w.documents[0]?.fileUrl ?? null,
      category: w.workforceCategory?.name ?? null,
      state: w.state,
      lga: w.lga,
      experienceLevel: w.experienceLevel,
      languages: w.languages,
      certified: w.certStatus === "APPROVED",
      backgroundClear: w.backgroundCheckStatus === "CLEAR",
      shortlisted: shortlistedIds.has(w.id),
    }));
  }

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Find workers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Search Oakvale-verified workers. Contact details stay private until you hire.
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
        <>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 2.5 }}>
              <WorkerFilters
                categories={categories}
                states={NIGERIAN_STATES}
                languages={LANGUAGES}
                values={{ category: categoryId, state, language }}
              />
            </CardContent>
          </Card>

          {workers.length === 0 ? (
            <EmptyState
              title="No workers match your search"
              description="Try widening your filters. New verified workers join regularly."
            />
          ) : (
            <>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {workers.length} verified worker{workers.length === 1 ? "" : "s"}
              </Typography>
              <Grid container spacing={2.5}>
                {workers.map((w) => (
                  <Grid key={w.id} size={{ xs: 12, sm: 6, md: 4 }}>
                    <Box>
                      <WorkerCard worker={w} />
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </PageTransition>
  );
}
