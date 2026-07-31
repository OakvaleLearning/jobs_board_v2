import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/motion";
import AddStaffForm from "@/components/admin/AddStaffForm";
import StaffTable from "@/components/admin/StaffTable";

export default async function AdminStaffPage() {
  const admin = await requireRole("ADMIN");

  const staff = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "AGENT"] } },
    orderBy: [{ deletedAt: "asc" }, { createdAt: "desc" }],
    select: { id: true, name: true, email: true, role: true, deletedAt: true },
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Staff
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Create Oakvale agents and platform admins, and deactivate accounts that should no longer
        have access.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add staff member
          </Typography>
          <AddStaffForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Existing staff
          </Typography>
          <StaffTable staff={staff} currentAdminId={admin.id} />
        </CardContent>
      </Card>
    </PageTransition>
  );
}
