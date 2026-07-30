import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listPlacementsForUser } from "@/lib/placement";
import ComplaintForm from "@/components/complaints/ComplaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";
import { PageTransition } from "@/components/motion";

export default async function WorkerComplaintsPage() {
  const user = await requireRole("WORKER");
  const [complaints, placements] = await Promise.all([
    prisma.complaint.findMany({ where: { raisedById: user.id }, orderBy: { createdAt: "desc" } }),
    listPlacementsForUser(user.id, "WORKER"),
  ]);

  const placementOptions = placements.map((p) => ({
    id: p.id,
    label: `${p.roleTitle} · ${p.employer.orgName ?? p.employer.user.name}`,
  }));

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Complaints
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Raise and track issues. Every case gets a reference and an Oakvale handler.
      </Typography>
      <Stack spacing={3}>
        <ComplaintForm role="worker" placements={placementOptions} />
        <ComplaintList complaints={complaints} />
      </Stack>
    </PageTransition>
  );
}
