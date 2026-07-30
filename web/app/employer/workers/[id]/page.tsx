import { notFound } from "next/navigation";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Alert from "@mui/material/Alert";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId, employerBlockReason } from "@/lib/employer";
import { certStatusMeta, backgroundCheckMeta, employmentTypeLabels, formatSalaryRange } from "@/lib/constants";
import StatusBadge from "@/components/StatusBadge";
import Button from "@mui/material/Button";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import ShortlistButton from "@/components/employer/ShortlistButton";
import LinkButton from "@/components/LinkButton";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/reviews/ReviewList";
import { visibleReviewsForWorker } from "@/lib/reviews";
import { PageTransition } from "@/components/motion";
import { startConversationWithWorker } from "@/app/messages-actions";

export default async function WorkerProfileView({ params }: PageProps<"/employer/workers/[id]">) {
  const user = await requireRole("EMPLOYER");
  const profile = await getEmployerProfileByUserId(user.id);
  if (employerBlockReason(profile)) notFound();

  const { id } = await params;
  const worker = await prisma.workerProfile.findFirst({
    where: { id, searchable: true, deletedAt: null },
    include: {
      user: { select: { name: true } },
      workforceCategory: true,
      educations: { orderBy: { createdAt: "asc" } },
      experiences: { orderBy: { createdAt: "asc" } },
      documents: { where: { type: { in: ["SELFIE", "VIDEO_INTRO"] } } },
    },
  });
  if (!worker) notFound();

  const shortlisted = !!(await prisma.shortlist.findFirst({
    where: { employerId: profile!.id, workerId: worker.id, jobId: null },
  }));

  const reviews = await visibleReviewsForWorker(worker.userId);
  const selfie = worker.documents.find((d) => d.type === "SELFIE");

  return (
    <PageTransition sx={{ maxWidth: 900, mx: "auto" }}>
      <LinkButton href="/employer/workers" color="inherit" size="small" sx={{ mb: 2 }}>
        ← Back to search
      </LinkButton>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ p: 3, textAlign: "center" }}>
              <Avatar
                src={selfie?.fileUrl}
                sx={{ width: 96, height: 96, mx: "auto", mb: 2, bgcolor: "primary.main", fontSize: 36 }}
              >
                {worker.user.name.slice(0, 1)}
              </Avatar>
              <Typography variant="h6">{worker.user.name}</Typography>
              <Typography color="text.secondary" sx={{ mb: 1 }}>
                {worker.workforceCategory?.name ?? "Care worker"}
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <StarRating value={worker.ratingAvg} count={worker.ratingCount} />
              </Box>
              <Stack spacing={1} sx={{ alignItems: "center", mb: 2 }}>
                {worker.certStatus === "APPROVED" && (
                  <Chip icon={<VerifiedRoundedIcon />} label="Oakvale verified" color="primary" size="small" />
                )}
                <StatusBadge meta={backgroundCheckMeta[worker.backgroundCheckStatus]} />
              </Stack>
              <ShortlistButton workerId={worker.id} shortlisted={shortlisted} />
              <Box component="form" action={startConversationWithWorker.bind(null, worker.id)} sx={{ mt: 1.5 }}>
                <Button type="submit" variant="outlined" startIcon={<ChatRoundedIcon />} fullWidth>
                  Message
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Alert icon={<LockRoundedIcon />} severity="info" sx={{ mt: 2 }}>
            Contact details are released once you hire this worker.
          </Alert>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography sx={{ mb: 2 }}>
                {worker.personalStatement || "No personal statement provided."}
              </Typography>

              <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1, mb: 1 }}>
                <Chip label={`Location: ${[worker.lga, worker.state].filter(Boolean).join(", ") || "—"}`} variant="outlined" size="small" />
                <Chip label={`Experience: ${worker.experienceLevel ?? "—"}`} variant="outlined" size="small" />
                <Chip
                  label={`Expected: ${formatSalaryRange(worker.expectedSalaryMin, worker.expectedSalaryMax, worker.salaryCurrency)}`}
                  variant="outlined"
                  size="small"
                />
                {worker.willingToRelocate && <Chip label="Willing to relocate" size="small" />}
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                {worker.employmentTypes.map((t) => (
                  <Chip key={t} label={employmentTypeLabels[t]} size="small" color="primary" variant="outlined" />
                ))}
              </Stack>
              <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
                {worker.languages.map((l) => (
                  <Chip key={l} label={l} size="small" variant="outlined" />
                ))}
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h6" gutterBottom>
                Experience
              </Typography>
              {worker.experiences.length === 0 ? (
                <Typography color="text.secondary">No experience listed.</Typography>
              ) : (
                <Stack spacing={1.5}>
                  {worker.experiences.map((e) => (
                    <Box key={e.id}>
                      <Typography sx={{ fontWeight: 600 }}>{e.roleTitle}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {e.employer}
                      </Typography>
                      {e.description && <Typography variant="body2">{e.description}</Typography>}
                    </Box>
                  ))}
                </Stack>
              )}

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h6" gutterBottom>
                Education
              </Typography>
              {worker.educations.length === 0 ? (
                <Typography color="text.secondary">No education listed.</Typography>
              ) : (
                <Stack spacing={1}>
                  {worker.educations.map((ed) => (
                    <Typography key={ed.id}>
                      <strong>{ed.qualification}</strong> — {ed.institution}
                    </Typography>
                  ))}
                </Stack>
              )}

              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <StatusBadge meta={certStatusMeta[worker.certStatus]} />
              </Stack>

              <Divider sx={{ my: 2.5 }} />

              <Typography variant="h6" gutterBottom>
                Reviews from employers
              </Typography>
              <ReviewList
                reviews={reviews.map((r) => ({
                  id: r.id,
                  rating: r.rating,
                  comment: r.comment,
                  createdAt: r.createdAt,
                  contextLabel: r.placement?.roleTitle ?? null,
                }))}
                emptyText="This worker has no reviews yet."
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </PageTransition>
  );
}
