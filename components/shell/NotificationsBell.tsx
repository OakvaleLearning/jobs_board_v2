"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";

type Item = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: string;
};

export default function NotificationsBell() {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [unread, setUnread] = useState(0);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setItems(data.items);
      setUnread(data.unread);
    } catch {
      // ignore — bell is non-critical
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [load]);

  const open = async (e: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(e.currentTarget);
    if (unread > 0) {
      await fetch("/api/notifications", { method: "PATCH" });
      setUnread(0);
    }
  };

  const go = (item: Item) => {
    setAnchorEl(null);
    if (item.link) router.push(item.link);
  };

  return (
    <>
      <IconButton onClick={open} aria-label={`Notifications (${unread} unread)`}>
        <Badge badgeContent={unread} color="error">
          <NotificationsRoundedIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { width: 360, maxHeight: 420 } } }}
      >
        <Box sx={{ px: 2, py: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>Notifications</Typography>
        </Box>
        <Divider />
        {items.length === 0 && (
          <Box sx={{ px: 2, py: 4, textAlign: "center" }}>
            <Typography color="text.secondary">You&apos;re all caught up.</Typography>
          </Box>
        )}
        {items.map((n) => (
          <MenuItem
            key={n.id}
            onClick={() => go(n)}
            sx={{
              whiteSpace: "normal",
              alignItems: "flex-start",
              py: 1.25,
              opacity: n.read ? 0.7 : 1,
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: n.read ? 500 : 700, fontSize: "0.92rem" }}>
                {n.title}
              </Typography>
              {n.body && (
                <Typography variant="body2" color="text.secondary">
                  {n.body}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {new Date(n.createdAt).toLocaleString()}
              </Typography>
            </Box>
          </MenuItem>
        ))}
        {items.length > 0 && (
          <Box sx={{ px: 2, py: 1, textAlign: "center" }}>
            <Button size="small" onClick={load}>
              Refresh
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
}
