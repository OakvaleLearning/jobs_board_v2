import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { verificationStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import DocLinks from "@/components/admin/DocLinks";
import ReviewButtons from "@/components/admin/ReviewButtons";
import { decideEmployer } from "@/app/admin/actions";
import { PageTransition } from "@/components/motion";

export default async function AdminEmployersPage() {
  await requireRole("ADMIN", "AGENT");
  const employers = await prisma.employerProfile.findMany({
    where: { deletedAt: null },
    include: { user: true, documents: true, employerType: true, _count: { select: { jobs: true } } },
    orderBy: [{ verificationStatus: "asc" }, { createdAt: "desc" }],
  });

  const pending = employers.filter((e) => e.verificationStatus === "PENDING");
  const others = employers.filter((e) => e.verificationStatus !== "PENDING");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Employers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Verify new employer accounts before they can post jobs or search workers.
      </Typography>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Awaiting verification ({pending.length})
      </Typography>
      {pending.length === 0 ? (
        <EmptyState title="No employers awaiting verification" />
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pending.map((e) => (
            <Card key={e.id}>
              <CardContent sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", mb: 0.5 }}>
                      <Typography variant="h6">
                        {e.orgName ?? e.contactName ?? e.user.name}
                      </Typography>
                      <Chip label={e.kind === "ORGANIZATION" ? "Organization" : "Individual"} size="small" />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {e.user.email} · {e.country ?? "—"} · registered {formatDate(e.createdAt)}
                    </Typography>
                    {e.kind === "ORGANIZATION" && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Sector: {e.sector ?? "—"} · CAC: {e.cacNumber ?? "—"}
                      </Typography>
                    )}
                    {e.address && (
                      <Typography variant="body2" color="text.secondary">
                        {e.address}
                      </Typography>
                    )}
                    <Box sx={{ mt: 1.5 }}>
                      <DocLinks
                        docs={e.documents.map((d) => ({ label: d.type, fileUrl: d.fileUrl }))}
                      />
                    </Box>
                  </Box>
                  <ReviewButtons
                    id={e.id}
                    action={decideEmployer}
                    approveLabel="Verify"
                    rejectLabel="Decline"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        All employers ({others.length})
      </Typography>
      <Stack spacing={1.5}>
        {others.map((e) => (
          <Card key={e.id}>
            <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>
                  {e.orgName ?? e.contactName ?? e.user.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {e.user.email} · {e._count.jobs} job{e._count.jobs === 1 ? "" : "s"}
                </Typography>
              </Box>
              <StatusBadge meta={verificationStatusMeta[e.verificationStatus]} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
