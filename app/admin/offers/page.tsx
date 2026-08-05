import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { offerStatusMeta, currencySymbols, employmentTypeLabels } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import ReviewButtons from "@/components/admin/ReviewButtons";
import { decideOffer } from "@/app/admin/offer-actions";
import { PageTransition } from "@/components/motion";

export default async function AdminOffersPage() {
  await requireRole("ADMIN", "AGENT");
  const offers = await prisma.offer.findMany({
    include: {
      application: {
        include: {
          worker: { include: { user: { select: { name: true } } } },
          job: { include: { employer: { select: { orgName: true, contactName: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = offers.filter((o) => o.status === "PENDING_ADMIN");
  const others = offers.filter((o) => o.status !== "PENDING_ADMIN");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Offers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Review employer offers before they reach workers. Approving releases the offer to the worker.
      </Typography>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Awaiting release ({pending.length})
      </Typography>
      {pending.length === 0 ? (
        <EmptyState title="No offers awaiting review" />
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pending.map((o) => (
            <Card key={o.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6">{o.roleTitle}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {o.application.job.employer.orgName ?? o.application.job.employer.contactName} →{" "}
                      {o.application.worker.user.name}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {employmentTypeLabels[o.employmentType]} · {currencySymbols[o.salaryCurrency]}
                      {o.salary.toLocaleString()}/mo · starts {formatDate(o.startDate)}
                    </Typography>
                    {o.conditions && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {o.conditions}
                      </Typography>
                    )}
                  </Box>
                  <ReviewButtons
                    id={o.id}
                    action={decideOffer}
                    approveLabel="Release to worker"
                    rejectLabel="Return to employer"
                    rejectTitle="Ask the employer to revise the offer"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        All offers ({others.length})
      </Typography>
      <Stack spacing={1.5}>
        {others.map((o) => (
          <Card key={o.id}>
            <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{o.roleTitle}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {o.application.worker.user.name} · {formatDate(o.createdAt)}
                </Typography>
              </Box>
              <StatusBadge meta={offerStatusMeta[o.status]} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
