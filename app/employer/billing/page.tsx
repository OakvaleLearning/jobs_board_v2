import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getBillingProfile, subscriptionActive, creditBalance } from "@/lib/subscription";
import { gatewayFor } from "@/lib/payments";
import { creditPrice, planTierLabels } from "@/lib/plans";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import PayInvoiceButton from "@/components/employer/PayInvoiceButton";
import BillingCallback from "@/components/employer/BillingCallback";
import PlanCallback from "@/components/employer/PlanCallback";
import BuyCreditsCard from "@/components/employer/BuyCreditsCard";
import LinkButton from "@/components/LinkButton";
import Grid from "@mui/material/Grid";
import { PageTransition } from "@/components/motion";
import { invoiceStatusMeta, invoiceTypeLabels, formatMoney, currencySymbols } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function EmployerBillingPage({ searchParams }: PageProps<"/employer/billing">) {
  const user = await requireRole("EMPLOYER");
  const employer = await getBillingProfile(user.id);
  const sp = await searchParams;
  const reference = typeof sp.reference === "string" ? sp.reference : null;

  const invoices = employer
    ? await prisma.invoice.findMany({ where: { employerId: employer.id }, orderBy: { createdAt: "desc" } })
    : [];

  const currency = employer?.currency ?? "NGN";
  const gateway = employer ? gatewayFor(employer.accountType, currency) : null;
  // Legacy placement-fee invoices still settle through Paystack directly, so
  // their button keeps its own simulation notice.
  const devMode = !gateway || !gateway.isLive();
  const planActive = subscriptionActive(employer);

  return (
    <PageTransition>
      {/* A reference can come back from either checkout path; both verifiers
          are no-ops for a reference they don't own. */}
      {reference && <BillingCallback reference={reference} />}
      {reference && <PlanCallback reference={reference} />}

      <Typography variant="h4" gutterBottom>
        Billing
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Your plan, interview credits and invoices. Platform fees are separate from any salary you
        agree with a caregiver.
      </Typography>

      {devMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No live payment credentials are configured, so checkout runs in simulation mode —
          purchases apply immediately and no money moves.
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Your plan
              </Typography>
              {planActive && employer?.planTier ? (
                <>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    {planTierLabels[employer.planTier]} ·{" "}
                    {employer.accountType === "DIASPORA_GLOBAL" ? "Diaspora Sponsor" : "Local Employer"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Renews {formatDate(employer.periodEnd)} · billed in {currency}
                  </Typography>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  You don&apos;t have an active subscription.
                </Typography>
              )}
              <LinkButton href="/employer/plans" variant={planActive ? "outlined" : "contained"}>
                {planActive ? "Manage plan" : "Choose a plan"}
              </LinkButton>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <BuyCreditsCard
            balance={creditBalance(employer)}
            unitPriceLabel={formatMoney(creditPrice(currency), currency)}
            formatTotal={`${currencySymbols[currency]}{}`}
            unitPrice={creditPrice(currency)}
            canBuy={!!employer}
          />
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom>
        Invoices
      </Typography>

      {invoices.length === 0 ? (
        <EmptyState title="No invoices" description="Invoices appear here once you subscribe to a plan or have an active placement." />
      ) : (
        <Stack spacing={2}>
          {invoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="h6">{inv.number}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {invoiceTypeLabels[inv.type]} · {formatMoney(inv.amount, inv.currency)} · due {formatDate(inv.dueAt)}
                      {inv.paidAt ? ` · paid ${formatDate(inv.paidAt)}` : ""}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                    <StatusBadge meta={invoiceStatusMeta[inv.status]} size="medium" />
                    {(inv.status === "ISSUED" || inv.status === "OVERDUE") && (
                      <PayInvoiceButton invoiceId={inv.id} devMode={devMode} />
                    )}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </PageTransition>
  );
}
