import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { listPlacementsForUser } from "@/lib/placement";
import ComplaintForm from "@/components/complaints/ComplaintForm";
import ComplaintList from "@/components/complaints/ComplaintList";
import { PageTransition } from "@/components/motion";

export default async function EmployerComplaintsPage() {
  const user = await requireRole("EMPLOYER");
  const [complaints, placements] = await Promise.all([
    prisma.complaint.findMany({ where: { raisedById: user.id }, orderBy: { createdAt: "desc" } }),
    listPlacementsForUser(user.id, "EMPLOYER"),
  ]);

  const placementOptions = placements.map((p) => ({
    id: p.id,
    label: `${p.roleTitle} · ${p.worker.user.name}`,
  }));

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Complaints
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Raise and track issues with a placement. Every case gets a reference and an Oakvale handler.
      </Typography>
      <Stack spacing={3}>
        <ComplaintForm role="employer" placements={placementOptions} />
        <ComplaintList complaints={complaints} />
      </Stack>
    </PageTransition>
  );
}
