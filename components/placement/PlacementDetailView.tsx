import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import StatusBadge from "@/components/StatusBadge";
import ContractCard from "@/components/placement/ContractCard";
import WelfareCheckForm from "@/components/agent/WelfareCheckForm";
import MarkCpdButton from "@/components/agent/MarkCpdButton";
import ReplacementButton from "@/components/placement/ReplacementButton";
import ReviewForm from "@/components/reviews/ReviewForm";
import StarRating from "@/components/StarRating";
import ModerateReviewButton from "@/components/reviews/ModerateReviewButton";
import { canReview } from "@/lib/reviews";
import { reviewDirectionLabels, reviewStatusMeta } from "@/lib/constants";
import {
  placementStatusMeta,
  cpdStatusMeta,
  wellbeingMeta,
  welfareMethodLabels,
  invoiceStatusMeta,
  formatMoney,
} from "@/lib/constants";
import { cpdStatus, guaranteeDaysLeft } from "@/lib/placement";
import { formatDate } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";
import { placementInclude } from "@/lib/placement";

type PlacementFull = Prisma.PlacementGetPayload<{ include: typeof placementInclude }>;

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function PlacementDetailView({
  placement,
  viewerRole,
  viewerUserId,
}: {
  placement: PlacementFull;
  viewerRole: string;
  viewerUserId: string;
}) {
  const isAgent = viewerRole === "AGENT" || viewerRole === "ADMIN";
  const isEmployerOwner = viewerRole === "EMPLOYER" && placement.employer.userId === viewerUserId;
  const isWorker = viewerRole === "WORKER" && placement.worker.userId === viewerUserId;

  const cpd = cpdStatus(placement.worker.cpdNextDueAt);
  const daysLeft = guaranteeDaysLeft(placement.guaranteeWindowEnds);

  // Reviews
  const allowedDirection = canReview(placement, viewerUserId, viewerRole);
  const ownDirection = isEmployerOwner
    ? "EMPLOYER_ON_WORKER"
    : isWorker
      ? "WORKER_ON_EMPLOYER"
      : null;
  const counterpartDirection =
    ownDirection === "EMPLOYER_ON_WORKER" ? "WORKER_ON_EMPLOYER" : "EMPLOYER_ON_WORKER";
  const ownReview = ownDirection
    ? placement.reviews.find((r) => r.direction === ownDirection)
    : null;
  const counterpartReview = ownDirection
    ? placement.reviews.find((r) => r.direction === counterpartDirection && r.status === "PUBLISHED")
    : null;
  const workerName = placement.worker.user.name;
  const employerName = placement.employer.orgName ?? placement.employer.user.name;
  const reviewSubjectLabel = isEmployerOwner ? workerName : employerName;
  const counterpartAuthorLabel = isEmployerOwner ? workerName : employerName;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <Box>
          <Typography variant="h4">{placement.roleTitle}</Typography>
          <Typography color="text.secondary">
            {placement.worker.user.name} ↔ {placement.employer.orgName ?? placement.employer.user.name}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
          <StatusBadge meta={placementStatusMeta[placement.status]} size="medium" />
          {cpd && <StatusBadge meta={cpdStatusMeta[cpd]} size="medium" />}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Summary */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Placement details
              </Typography>
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Field label="Start date" value={formatDate(placement.startDate)} />
                </Grid>
                <Grid size={6}>
                  <Field
                    label="Salary"
                    value={placement.salary ? `${formatMoney(placement.salary, placement.salaryCurrency)}/mo` : "As agreed"}
                  />
                </Grid>
                <Grid size={6}>
                  <Field label="Account manager" value={placement.accountManager?.name ?? "Unassigned"} />
                </Grid>
                <Grid size={6}>
                  <Field
                    label="Guarantee window"
                    value={
                      daysLeft !== null
                        ? daysLeft >= 0
                          ? `${daysLeft} days left`
                          : "Elapsed"
                        : "—"
                    }
                  />
                </Grid>
                {(isEmployerOwner || isAgent || isWorker) && placement.status === "ACTIVE" && (
                  <Grid size={6}>
                    <Field
                      label="Contact"
                      value={
                        <>
                          {placement.worker.user.email}
                          <br />
                          {placement.worker.user.phone ?? "—"}
                        </>
                      }
                    />
                  </Grid>
                )}
              </Grid>

              {(isEmployerOwner || isAgent) && placement.status === "ACTIVE" && (
                <Box sx={{ mt: 3 }}>
                  <ReplacementButton placementId={placement.id} />
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* CPD */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                CPD compliance
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {cpd ? <StatusBadge meta={cpdStatusMeta[cpd]} /> : <Typography variant="body2">Not on a CPD cycle</Typography>}
                </Box>
                <Field label="Last completed" value={formatDate(placement.worker.cpdLastCompletedAt)} />
                <Field label="Next due" value={formatDate(placement.worker.cpdNextDueAt)} />
                {isAgent && (
                  <Box sx={{ mt: 1 }}>
                    <MarkCpdButton placementId={placement.id} workerId={placement.workerId} />
                  </Box>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Contracts */}
        <Grid size={12}>
          <Typography variant="h6" gutterBottom>
            Contracts
          </Typography>
          <Grid container spacing={2}>
            {placement.contracts.length === 0 && (
              <Grid size={12}>
                <Typography color="text.secondary" variant="body2">
                  Contracts are being prepared.
                </Typography>
              </Grid>
            )}
            {placement.contracts.map((c) => {
              const canSign =
                (c.type === "WORKER_PLACEMENT" && isWorker) ||
                (c.type === "EMPLOYER_SERVICE" && isEmployerOwner);
              const signerLabel =
                c.type === "WORKER_PLACEMENT" ? placement.worker.user.name : placement.employer.orgName ?? placement.employer.user.name;
              return (
                <Grid size={{ xs: 12, md: 6 }} key={c.id}>
                  <ContractCard
                    contractId={c.id}
                    type={c.type}
                    status={c.status}
                    pdfUrl={c.pdfUrl}
                    canSign={canSign}
                    signerLabel={signerLabel}
                  />
                </Grid>
              );
            })}
          </Grid>
        </Grid>

        {/* Welfare */}
        <Grid size={{ xs: 12, md: isAgent ? 7 : 12 }}>
          <Card sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Welfare checks
              </Typography>
              {placement.welfareChecks.length === 0 ? (
                <Typography color="text.secondary" variant="body2">
                  No welfare checks logged yet.
                </Typography>
              ) : (
                <Stack spacing={2} divider={<Divider flexItem />}>
                  {placement.welfareChecks.map((w) => (
                    <Box key={w.id}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                        <Typography variant="subtitle2">
                          {formatDate(w.date)} · {welfareMethodLabels[w.method]}
                        </Typography>
                        <StatusBadge meta={wellbeingMeta[w.wellbeing]} />
                      </Box>
                      {w.issues && (
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          <strong>Issues:</strong> {w.issues}
                        </Typography>
                      )}
                      {w.actionTaken && (
                        <Typography variant="body2" color="text.secondary">
                          {w.actionTaken}
                        </Typography>
                      )}
                      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Logged by {w.agent?.name ?? "Oakvale"}
                        </Typography>
                        {w.reportPdfUrl && (
                          <Link href={w.reportPdfUrl} target="_blank" rel="noopener" variant="caption" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                            <DownloadRoundedIcon sx={{ fontSize: 14 }} /> Report
                          </Link>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>

        {isAgent && (
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ height: "100%" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Log a welfare check
                </Typography>
                <WelfareCheckForm placementId={placement.id} />
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Invoices */}
        {(isEmployerOwner || isAgent) && placement.invoices.length > 0 && (
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Invoices
                </Typography>
                <Stack spacing={1.5} divider={<Divider flexItem />}>
                  {placement.invoices.map((inv) => (
                    <Box key={inv.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="body2">
                        {inv.number} · {formatMoney(inv.amount, inv.currency)}
                      </Typography>
                      <StatusBadge meta={invoiceStatusMeta[inv.status]} />
                    </Box>
                  ))}
                </Stack>
                {isEmployerOwner && (
                  <Link href="/employer/billing" sx={{ mt: 2, display: "inline-block" }} variant="body2">
                    Go to billing →
                  </Link>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Reviews */}
        <Grid size={12}>
          <Typography variant="h6" gutterBottom>
            Reviews
          </Typography>
        </Grid>

        {/* Party view: your review + the other party's review */}
        {(isEmployerOwner || isWorker) && (
          <>
            <Grid size={{ xs: 12, md: 6 }}>
              {allowedDirection ? (
                <ReviewForm
                  placementId={placement.id}
                  subjectLabel={reviewSubjectLabel}
                  existing={ownReview ? { rating: ownReview.rating, comment: ownReview.comment } : null}
                />
              ) : ownReview ? (
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Your review
                    </Typography>
                    <StarRating value={ownReview.rating} count={1} showCount={false} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {ownReview.comment}
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      You can review this placement once it has ended or passed its guarantee window.
                    </Typography>
                  </CardContent>
                </Card>
              )}
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {counterpartAuthorLabel}&apos;s review
                  </Typography>
                  {counterpartReview ? (
                    <>
                      <StarRating value={counterpartReview.rating} count={1} showCount={false} />
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {counterpartReview.comment}
                      </Typography>
                    </>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No review from the other party yet.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </>
        )}

        {/* Staff view: all reviews with moderation */}
        {isAgent && (
          <Grid size={12}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                {placement.reviews.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No reviews on this placement yet.
                  </Typography>
                ) : (
                  <Stack spacing={2} divider={<Divider flexItem />}>
                    {placement.reviews.map((r) => (
                      <Box key={r.id}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <StarRating value={r.rating} count={1} showCount={false} />
                            <StatusBadge meta={reviewStatusMeta[r.status]} />
                          </Box>
                          <ModerateReviewButton reviewId={r.id} hidden={r.status === "HIDDEN"} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {reviewDirectionLabels[r.direction]} · {r.author?.name ?? "—"}
                          {r.status === "HIDDEN" ? " · hidden" : ""}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                          {r.comment}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
