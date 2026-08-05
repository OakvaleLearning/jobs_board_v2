import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { certStatusMeta } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import DocLinks from "@/components/admin/DocLinks";
import ReviewButtons from "@/components/admin/ReviewButtons";
import LinkButton from "@/components/LinkButton";
import { decideCertificate } from "@/app/admin/actions";
import { PageTransition } from "@/components/motion";

export default async function AdminCertificatesPage() {
  await requireRole("ADMIN", "AGENT");
  const workers = await prisma.workerProfile.findMany({
    where: { certStatus: { in: ["PENDING", "APPROVED", "REJECTED"] }, deletedAt: null },
    include: { user: true, documents: { where: { type: "CERTIFICATE" } } },
    orderBy: [{ certStatus: "asc" }, { updatedAt: "desc" }],
  });

  const pending = workers.filter((w) => w.certStatus === "PENDING");
  const reviewed = workers.filter((w) => w.certStatus !== "PENDING");

  return (
    <PageTransition>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center", mb: 1 }}>
        <Typography variant="h4">Certificate cross-check</Typography>
        <LinkButton
          href="/admin/certificates/export"
          variant="outlined"
          startIcon={<DownloadRoundedIcon />}
        >
          Export pending to CSV
        </LinkButton>
      </Box>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Cross-reference uploaded certificates against Oakvale&apos;s register. A worker can&apos;t apply to
        jobs until their certificate is approved.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Export the pending list to CSV to check names against your internal records in bulk, then approve
        or reject each below.
      </Alert>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Awaiting cross-check ({pending.length})
      </Typography>
      {pending.length === 0 ? (
        <EmptyState title="No certificates awaiting review" />
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pending.map((w) => (
            <Card key={w.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="h6">{w.user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {w.user.email} · {w.user.phone ?? "—"}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      Number: {w.certificateNumber || "— (not provided)"} · Programme:{" "}
                      {w.certProgramme || "—"} · Completed: {formatDate(w.certCompletionDate)}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                      <DocLinks
                        docs={w.documents.map((d) => ({ label: "View certificate", fileUrl: d.fileUrl }))}
                      />
                    </Box>
                  </Box>
                  <ReviewButtons
                    id={w.id}
                    action={decideCertificate}
                    approveLabel="Verify certificate"
                    rejectLabel="Reject"
                  />
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Reviewed ({reviewed.length})
      </Typography>
      <Stack spacing={1.5}>
        {reviewed.map((w) => (
          <Card key={w.id}>
            <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{w.user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {w.certificateNumber || "no number"} · {formatDate(w.updatedAt)}
                </Typography>
              </Box>
              <StatusBadge meta={certStatusMeta[w.certStatus]} />
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
