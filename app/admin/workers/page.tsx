import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { profileStatusMeta, certStatusMeta, documentTypeLabels } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EmptyState from "@/components/EmptyState";
import DocLinks from "@/components/admin/DocLinks";
import ReviewButtons from "@/components/admin/ReviewButtons";
import NotesActionButton from "@/components/admin/NotesActionButton";
import { decideWorkerProfile, suspendWorker } from "@/app/admin/actions";
import { PageTransition } from "@/components/motion";

export default async function AdminWorkersPage() {
  await requireRole("ADMIN", "AGENT");
  const workers = await prisma.workerProfile.findMany({
    where: { deletedAt: null, profileStatus: { not: "DRAFT" } },
    include: { user: true, documents: true, workforceCategory: true },
    orderBy: [{ profileStatus: "asc" }, { updatedAt: "desc" }],
  });

  const pending = workers.filter((w) => w.profileStatus === "PENDING");
  const others = workers.filter((w) => w.profileStatus !== "PENDING");

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Workers
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Approve worker profiles submitted for review. Certificate checks are handled separately.
      </Typography>

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        Awaiting approval ({pending.length})
      </Typography>
      {pending.length === 0 ? (
        <EmptyState title="No profiles awaiting approval" />
      ) : (
        <Stack spacing={2} sx={{ mb: 4 }}>
          {pending.map((w) => (
            <Card key={w.id}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between" }}>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6">{w.user.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {w.workforceCategory?.name ?? "No category"} · {w.state ?? "—"}
                      {w.lga ? `, ${w.lga}` : ""} · {w.completionPercent}% complete
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ my: 1.5 }}>
                      <StatusBadge meta={profileStatusMeta[w.profileStatus]} />
                      <StatusBadge meta={certStatusMeta[w.certStatus]} />
                    </Stack>
                    {w.personalStatement && (
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        {w.personalStatement}
                      </Typography>
                    )}
                    <DocLinks
                      docs={w.documents.map((d) => ({
                        label: documentTypeLabels[d.type],
                        fileUrl: d.fileUrl,
                      }))}
                    />
                  </Box>
                  <Stack spacing={1}>
                    <ReviewButtons id={w.id} action={decideWorkerProfile} approveLabel="Approve" rejectLabel="Request changes" />
                    <NotesActionButton
                      id={w.id}
                      action={suspendWorker}
                      label="Suspend"
                      dialogTitle="Suspend this worker"
                      confirmLabel="Suspend"
                      color="error"
                      size="small"
                    />
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" sx={{ mb: 1.5 }}>
        All submitted workers ({others.length})
      </Typography>
      <Stack spacing={1.5}>
        {others.map((w) => (
          <Card key={w.id}>
            <CardContent sx={{ p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography sx={{ fontWeight: 600 }}>{w.user.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {w.workforceCategory?.name ?? "—"} · updated {formatDate(w.updatedAt)}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <StatusBadge meta={profileStatusMeta[w.profileStatus]} />
                <StatusBadge meta={certStatusMeta[w.certStatus]} />
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
