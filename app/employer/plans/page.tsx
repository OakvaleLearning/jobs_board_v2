import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import { requireRole } from "@/lib/session";
import { getBillingProfile, subscriptionActive, creditBalance } from "@/lib/subscription";
import {
  plansFor,
  planTierLabels,
  planPrice,
  gatewayLabels,
  accountTypeLabels,
  creditPrice,
} from "@/lib/plans";
import { gatewayFor } from "@/lib/payments";
import { formatMoney, currencyLabels } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import PlanCards, { type PlanCardModel } from "@/components/employer/PlanCards";
import PlanCallback from "@/components/employer/PlanCallback";
import { PageTransition } from "@/components/motion";

export default async function EmployerPlansPage({ searchParams }: PageProps<"/employer/plans">) {
  const user = await requireRole("EMPLOYER");
  const employer = await getBillingProfile(user.id);
  const sp = await searchParams;
  const reference = typeof sp.reference === "string" ? sp.reference : null;

  if (!employer) {
    return (
      <PageTransition>
        <Typography variant="h4" gutterBottom>
          Plans
        </Typography>
        <Alert severity="info">Complete your company profile before choosing a plan.</Alert>
      </PageTransition>
    );
  }

  const { accountType, currency } = employer;
  const active = subscriptionActive(employer);
  const gateway = gatewayFor(accountType, currency);
  const diaspora = accountType === "DIASPORA_GLOBAL";

  const cards: PlanCardModel[] = plansFor(accountType).map((plan) => ({
    tier: plan.tier,
    name: planTierLabels[plan.tier],
    price: planPrice(accountType, plan.tier, currency),
    currency,
    interviewsPerMonth: plan.features.interviewsPerMonth,
    features: [
      {
        label: plan.features.diasporaReadyPool
          ? "Full verified + diaspora-ready candidate pool"
          : "Full verified local candidate pool",
        included: true,
      },
      {
        label: "Oakvale certification & verified ID on every candidate",
        included: true,
      },
      {
        label: `${plan.features.interviewsPerMonth} virtual interview${
          plan.features.interviewsPerMonth === 1 ? "" : "s"
        } per month`,
        included: true,
      },
      {
        label: "Enhanced Vetting Pack — video intro, ID & police report bundle",
        included: plan.features.enhancedVettingPack,
      },
      {
        label: "Remote Care Oversight — digital care logs & progress reports",
        included: plan.features.remoteCareOversight,
      },
      {
        label: `Add-on interview credits at ${formatMoney(creditPrice(currency), currency)} each`,
        included: true,
      },
    ],
  }));

  return (
    <PageTransition>
      {reference && <PlanCallback reference={reference} />}

      <Typography variant="h4" gutterBottom>
        Plans &amp; subscription
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Platform subscriptions are software access and matchmaking fees paid to Oakvale. They are
        separate from any salary you agree with a caregiver.
      </Typography>

      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center" }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Account type
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{accountTypeLabels[accountType]}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Billing currency
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{currencyLabels[currency]}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Payment routing
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{gatewayLabels[accountType]}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Interview credits
              </Typography>
              <Typography sx={{ fontWeight: 600 }}>{creditBalance(employer)}</Typography>
            </Box>
          </Stack>

          {active && employer.planTier && (
            <Alert severity="success" sx={{ mt: 2.5 }}>
              <strong>{planTierLabels[employer.planTier]}</strong> plan active
              {employer.periodEnd ? ` until ${formatDate(employer.periodEnd)}` : ""}. Your monthly
              interview allowance is re-granted at the start of each period.
            </Alert>
          )}
          {!active && (
            <Alert severity="warning" sx={{ mt: 2.5 }}>
              You don&apos;t have an active plan. Choose one below to search the candidate directory
              and schedule interviews.
            </Alert>
          )}
        </CardContent>
      </Card>

      {!gateway.isLive() && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {diaspora
            ? "The Stripe/PayPal integration isn't wired to live credentials yet, so diaspora checkouts run in simulation mode — plans activate immediately and no money moves."
            : "Paystack isn't configured, so checkout runs in simulation mode."}
        </Alert>
      )}

      <PlanCards
        plans={cards}
        currentTier={employer.planTier}
        active={active}
        simulated={!gateway.isLive()}
      />

      <Box sx={{ mt: 3 }}>
        <Chip
          label={`Extra interview credits: ${formatMoney(creditPrice(currency), currency)} each — buy from Billing`}
          variant="outlined"
        />
      </Box>
    </PageTransition>
  );
}
