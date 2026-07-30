import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import { requireAgent } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { rankWorkers, getMatchingModel } from "@/lib/matching";
import { matchFactorLabels, type MatchFactor } from "@/lib/constants";
import EmptyState from "@/components/EmptyState";
import SendMatchButton from "@/components/agent/SendMatchButton";
import { PageTransition } from "@/components/motion";

export default async function AgentMatchingPage({ searchParams }: PageProps<"/agent/matching">) {
  await requireAgent();
  const sp = await searchParams;
  const jobId = typeof sp.job === "string" ? sp.job : "";

  const jobs = await prisma.job.findMany({
    where: { status: "APPROVED", deletedAt: null },
    include: { employer: { select: { orgName: true, user: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  const job = jobId ? jobs.find((j) => j.id === jobId) : null;
  const model = await getMatchingModel();
  const ranked = job
    ? await rankWorkers({
        workforceCategoryId: job.workforceCategoryId,
        state: job.state,
        employmentType: job.employmentType,
      })
    : [];

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Matching tool
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Pick a role to rank verified workers by a transparent match score, then send candidates to the
        employer&apos;s shortlist.
      </Typography>

      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center", mb: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
          {model.sampleSize > 0
            ? `Scoring weights (learned from ${model.sampleSize} completed placement${model.sampleSize === 1 ? "" : "s"}):`
            : "Scoring weights (base):"}
        </Typography>
        {(Object.keys(matchFactorLabels) as MatchFactor[]).map((f) => (
          <Chip
            key={f}
            size="small"
            variant="outlined"
            label={`${matchFactorLabels[f]} ${model.effectiveWeights[f]}`}
          />
        ))}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          {/* Native form GET navigation keeps this a server component. */}
          <Box component="form" method="get" sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
            <TextField select name="job" label="Role to match" defaultValue={jobId} sx={{ minWidth: 320, flexGrow: 1, maxWidth: 520 }}>
              <MenuItem value="">Select a role…</MenuItem>
              {jobs.map((j) => (
                <MenuItem key={j.id} value={j.id}>
                  {j.title} — {j.employer.orgName ?? j.employer.user.name}
                </MenuItem>
              ))}
            </TextField>
            <Button type="submit" variant="contained">
              Rank candidates
            </Button>
          </Box>
        </CardContent>
      </Card>

      {!job ? (
        <EmptyState title="No role selected" description="Select a role above to see ranked candidates." />
      ) : ranked.length === 0 ? (
        <EmptyState title="No candidates" description="No searchable workers match this role yet." />
      ) : (
        <Stack spacing={2}>
          {ranked.map((r) => (
            <Card key={r.workerId}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap" }}>
                  <Box sx={{ minWidth: 220, flexGrow: 1 }}>
                    <Typography variant="h6">{r.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {r.categoryName ?? "—"} · {r.state ?? "Location N/A"} · {r.experienceLevel ?? "Experience N/A"}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 1 }}>
                      {r.reasons.map((reason) => (
                        <Chip key={reason} label={reason} size="small" variant="outlined" color="primary" />
                      ))}
                    </Box>
                    <Box sx={{ mt: 1.5, maxWidth: 280 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          Match score
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 700 }}>
                          {r.score}%
                        </Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={r.score} sx={{ borderRadius: 1, height: 6 }} />
                    </Box>
                  </Box>
                  <SendMatchButton jobId={job.id} workerId={r.workerId} />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
