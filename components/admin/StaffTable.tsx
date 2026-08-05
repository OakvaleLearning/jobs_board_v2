"use client";

import { useTransition } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import { setStaffActive } from "@/app/admin/staff/actions";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  deletedAt: Date | null;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Platform Admin",
  AGENT: "Oakvale Agent",
};

function ActiveToggle({ id, active }: { id: string; active: boolean }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      size="small"
      color={active ? "error" : "success"}
      variant="outlined"
      disabled={pending}
      onClick={() => {
        if (active && !window.confirm("Deactivate this staff member? They will no longer be able to log in.")) {
          return;
        }
        startTransition(() => setStaffActive(id, !active));
      }}
    >
      {active ? "Deactivate" : "Reactivate"}
    </Button>
  );
}

export default function StaffTable({
  staff,
  currentAdminId,
}: {
  staff: StaffMember[];
  currentAdminId: string;
}) {
  if (staff.length === 0) {
    return (
      <Typography color="text.secondary">No staff accounts yet.</Typography>
    );
  }

  return (
    <>
      {/* Table view for md+ screens */}
      <TableContainer sx={{ display: { xs: "none", md: "block" } }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {staff.map((member) => {
              const active = member.deletedAt === null;
              const isSelf = member.id === currentAdminId;
              return (
                <TableRow key={member.id} sx={{ opacity: active ? 1 : 0.6 }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {member.name}
                      {isSelf && <Chip label="You" size="small" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{roleLabels[member.role]}</TableCell>
                  <TableCell>
                    <Chip
                      label={active ? "Active" : "Deactivated"}
                      size="small"
                      color={active ? "success" : "default"}
                      variant={active ? "filled" : "outlined"}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {isSelf ? (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    ) : (
                      <ActiveToggle id={member.id} active={active} />
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Card list for mobile / smaller screens */}
      <Stack spacing={2} sx={{ display: { xs: "flex", md: "none" } }}>
        {staff.map((member) => {
          const active = member.deletedAt === null;
          const isSelf = member.id === currentAdminId;
          return (
            <Card key={member.id} variant="outlined" sx={{ opacity: active ? 1 : 0.6 }}>
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
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle1">{member.name}</Typography>
                    {isSelf && <Chip label="You" size="small" variant="outlined" />}
                  </Box>
                  <Chip
                    label={active ? "Active" : "Deactivated"}
                    size="small"
                    color={active ? "success" : "default"}
                    variant={active ? "filled" : "outlined"}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {member.email}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {roleLabels[member.role]}
                </Typography>
                {isSelf ? (
                  <Typography variant="body2" color="text.secondary">
                    This is you
                  </Typography>
                ) : (
                  <ActiveToggle id={member.id} active={active} />
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </>
  );
}
