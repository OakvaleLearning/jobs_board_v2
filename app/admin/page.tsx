import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import CardLink from "@/components/CardLink";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import WorkRoundedIcon from "@mui/icons-material/WorkRounded";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/motion";
import type { ReactNode } from "react";

async function counts() {
  const [employers, workers, certs, jobs, offers] = await Promise.all([
    prisma.employerProfile.count({ where: { verificationStatus: "PENDING", deletedAt: null } }),
    prisma.workerProfile.count({ where: { profileStatus: "PENDING", deletedAt: null } }),
    prisma.workerProfile.count({ where: { certStatus: "PENDING", deletedAt: null } }),
    prisma.job.count({ where: { status: "PENDING_REVIEW", deletedAt: null } }),
    prisma.offer.count({ where: { status: "PENDING_ADMIN" } }),
  ]);
  return { employers, workers, certs, jobs, offers };
}

function QueueCard({
  href,
  icon,
  label,
  count,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  count: number;
}) {
  return (
    <Card>
      <CardLink href={href}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                color: "primary.main",
                bgcolor: "rgba(27,94,32,0.08)",
              }}
            >
              {icon}
            </Box>
            <Badge badgeContent={count} color="error" showZero={false}>
              <Typography variant="h3">{count}</Typography>
            </Badge>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            {label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {count === 0 ? "Nothing pending" : `${count} awaiting action`}
          </Typography>
        </CardContent>
      </CardLink>
    </Card>
  );
}

export default async function AdminOverview() {
  await requireRole("ADMIN", "AGENT");
  const c = await counts();

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Operations overview
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Everything waiting on the Oakvale team.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <QueueCard href="/admin/employers" icon={<BusinessRoundedIcon />} label="Employer verifications" count={c.employers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <QueueCard href="/admin/workers" icon={<PeopleAltRoundedIcon />} label="Worker approvals" count={c.workers} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <QueueCard href="/admin/certificates" icon={<WorkspacePremiumRoundedIcon />} label="Certificate checks" count={c.certs} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <QueueCard href="/admin/jobs" icon={<WorkRoundedIcon />} label="Job post reviews" count={c.jobs} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <QueueCard href="/admin/offers" icon={<LocalOfferRoundedIcon />} label="Offers to release" count={c.offers} />
        </Grid>
      </Grid>
    </PageTransition>
  );
}
