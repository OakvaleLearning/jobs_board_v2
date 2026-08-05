import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PageTransition } from "@/components/motion";

export default async function AdminAuditPage() {
  await requireRole("ADMIN");
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  return (
    <PageTransition>
      <Typography variant="h4" gutterBottom>
        Audit log
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        The 200 most recent actions across the platform, with actor and IP.
      </Typography>

      {/* Table view for md+ screens */}
      <Card sx={{ display: { xs: "none", md: "block" } }}>
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Actor</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((l) => (
                <TableRow key={l.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    {l.createdAt.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {l.user ? `${l.user.name}` : "System"}
                    {l.user && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {l.user.role}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip label={l.action} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    {l.entityType ? `${l.entityType}` : "—"}
                    {l.entityId && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        {l.entityId.slice(0, 10)}…
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{l.ip ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Card list for mobile / smaller screens */}
      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
        {logs.map((l) => (
          <Card key={l.id} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <Chip label={l.action} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                  {l.createdAt.toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body2">
                <Box component="span" color="text.secondary">Actor: </Box>
                {l.user ? l.user.name : "System"}
                {l.user && ` (${l.user.role})`}
              </Typography>
              <Typography variant="body2">
                <Box component="span" color="text.secondary">Entity: </Box>
                {l.entityType ? l.entityType : "—"}
                {l.entityId && ` · ${l.entityId.slice(0, 10)}…`}
              </Typography>
              <Typography variant="body2">
                <Box component="span" color="text.secondary">IP: </Box>
                {l.ip ?? "—"}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </PageTransition>
  );
}
