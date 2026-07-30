"use client";

import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

type Item = {
  id: string;
  other: { name: string; role: string };
  lastMessage: string | null;
  lastAt: Date;
};

export default function ConversationList({ items, basePath }: { items: Item[]; basePath: string }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No conversations yet"
        description="Messages with the people you connect with will appear here."
      />
    );
  }
  return (
    <Card>
      <List disablePadding>
        {items.map((c) => (
          <ListItemButton key={c.id} component={Link} href={`${basePath}/${c.id}`} divider>
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: "primary.main" }}>{c.other.name.slice(0, 1)}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={c.other.name}
              secondary={c.lastMessage ?? "No messages yet"}
              slotProps={{
                primary: { sx: { fontWeight: 600 } },
                secondary: { noWrap: true },
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Card>
  );
}
