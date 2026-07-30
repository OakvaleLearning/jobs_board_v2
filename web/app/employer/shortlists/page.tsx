import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId } from "@/lib/employer";
import EmptyState from "@/components/EmptyState";
import LinkButton from "@/components/LinkButton";
import WorkerCard from "@/components/employer/WorkerCard";
import { PageTransition } from "@/components/motion";

export default async function EmployerShortlistsPage() {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);

  const shortlist = profile
    ? await prisma.shortlist.findMany({
        where: { employerId: profile.id, jobId: null, worker: { searchable: true, deletedAt: null } },
        include: {
          worker: {
            include: {
              user: { select: { name: true } },
              workforceCategory: { select: { name: true } },
              documents: { where: { type: "SELFIE" }, select: { fileUrl: true }, take: 1 },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Shortlists
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Workers you&apos;ve saved. Open a profile to review them in full.
      </Typography>

      {shortlist.length === 0 ? (
        <EmptyState
          title="Your shortlist is empty"
          description="Save workers from search to compare them here."
          action={
            <LinkButton href="/employer/workers" variant="contained">
              Find workers
            </LinkButton>
          }
        />
      ) : (
        <Grid container spacing={2.5}>
          {shortlist.map((s) => (
            <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box>
                <WorkerCard
                  worker={{
                    id: s.worker.id,
                    name: s.worker.user.name,
                    photoUrl: s.worker.documents[0]?.fileUrl ?? null,
                    category: s.worker.workforceCategory?.name ?? null,
                    state: s.worker.state,
                    lga: s.worker.lga,
                    experienceLevel: s.worker.experienceLevel,
                    languages: s.worker.languages,
                    certified: s.worker.certStatus === "APPROVED",
                    backgroundClear: s.worker.backgroundCheckStatus === "CLEAR",
                    shortlisted: true,
                  }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </PageTransition>
  );
}
