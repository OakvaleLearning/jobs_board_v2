import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getEmployerProfileByUserId } from "@/lib/employer";
import { paystackConfigured } from "@/lib/paystack";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import PayInvoiceButton from "@/components/employer/PayInvoiceButton";
import BillingCallback from "@/components/employer/BillingCallback";
import { PageTransition } from "@/components/motion";
import { invoiceStatusMeta, invoiceTypeLabels, formatMoney } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export default async function EmployerBillingPage({ searchParams }: PageProps<"/employer/billing">) {
  const user = await requireRole("EMPLOYER");
  const employer = await getEmployerProfileByUserId(user.id);
  const sp = await searchParams;
  const reference = typeof sp.reference === "string" ? sp.reference : null;

  const invoices = employer
    ? await prisma.invoice.findMany({ where: { employerId: employer.id }, orderBy: { createdAt: "desc" } })
    : [];
  const devMode = !paystackConfigured();

  return (
    <PageTransition>
      {reference && <BillingCallback reference={reference} />}
      <Typography variant="h4" gutterBottom>
        Billing
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Placement-fee invoices for your account (NGN). Paid on 30-day net terms.
      </Typography>

      {devMode && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Paystack isn&apos;t configured, so payments run in simulation mode. Add a{" "}
          <code>PAYSTACK_SECRET_KEY</code> to enable live checkout.
        </Alert>
      )}

      {invoices.length === 0 ? (
        <EmptyState title="No invoices" description="Invoices appear here once you have an active placement." />
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
