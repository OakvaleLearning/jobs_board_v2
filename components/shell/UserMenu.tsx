"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";

export default function UserMenu({
  userName,
  roleLabel,
  dashboardHref,
  image,
}: {
  userName: string;
  roleLabel: string;
  dashboardHref: string;
  image?: string | null;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="Account menu"
        sx={{ p: 0.5 }}
      >
        <Avatar
          src={image ?? undefined}
          sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.95rem" }}
        >
          {userName.slice(0, 1).toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>{userName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href={dashboardHref} onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <DashboardRoundedIcon fontSize="small" />
          </ListItemIcon>
          My dashboard
        </MenuItem>
        <MenuItem component={Link} href="/account" onClick={() => setAnchorEl(null)}>
          <ListItemIcon>
            <SettingsRoundedIcon fontSize="small" />
          </ListItemIcon>
          Account settings
        </MenuItem>
        <MenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          <ListItemIcon>
            <LogoutRoundedIcon fontSize="small" />
          </ListItemIcon>
          Log out
        </MenuItem>
      </Menu>
    </>
  );
}
