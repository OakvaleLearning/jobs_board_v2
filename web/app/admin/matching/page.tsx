import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { getMatchingModel } from "@/lib/matching";
import MatchingEditor from "@/components/admin/MatchingEditor";
import { PageTransition } from "@/components/motion";
import { formatDate } from "@/lib/format";

export default async function AdminMatchingPage() {
  await requireRole("ADMIN");
  const model = await getMatchingModel();

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Matching weights
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The candidate ranker scores each worker as a weighted sum of transparent factors. Set the base
        weights below; the system automatically tunes them from placement outcomes (rating, complaints,
        replacements) and blends toward your defaults until enough data accrues.
      </Typography>

      <MatchingEditor
        baseWeights={model.baseWeights}
        learnedWeights={model.learnedWeights}
        effectiveWeights={model.effectiveWeights}
        sampleSize={model.sampleSize}
        lastLearnedAt={model.lastLearnedAt ? formatDate(model.lastLearnedAt) : null}
      />
    </PageTransition>
  );
}
