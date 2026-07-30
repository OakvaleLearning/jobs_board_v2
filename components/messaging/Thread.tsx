import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import MessageComposer from "@/components/messaging/MessageComposer";
import EmptyState from "@/components/EmptyState";

type Message = { id: string; senderId: string; body: string; createdAt: Date };

export default function Thread({
  conversationId,
  currentUserId,
  otherName,
  otherRole,
  messages,
}: {
  conversationId: string;
  currentUserId: string;
  otherName: string;
  otherRole: string;
  messages: Message[];
}) {
  return (
    <Card sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 180px)" }}>
      <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Avatar sx={{ bgcolor: "primary.main" }}>{otherName.slice(0, 1)}</Avatar>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>{otherName}</Typography>
          <Typography variant="caption" color="text.secondary">
            {otherRole === "WORKER" ? "Care worker" : "Employer"}
          </Typography>
        </Box>
      </Box>
      <Divider />

      <Box sx={{ flexGrow: 1, overflowY: "auto", p: 2, bgcolor: "rgba(27,94,32,0.02)" }}>
        {messages.length === 0 ? (
          <EmptyState title="No messages yet" description="Say hello — Oakvale can see this conversation." />
        ) : (
          <Stack spacing={1.25}>
            {messages.map((m) => {
              const mine = m.senderId === currentUserId;
              return (
                <Box key={m.id} sx={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                  <Box
                    sx={{
                      maxWidth: "75%",
                      px: 1.75,
                      py: 1,
                      borderRadius: 3,
                      borderBottomRightRadius: mine ? 4 : 12,
                      borderBottomLeftRadius: mine ? 12 : 4,
                      bgcolor: mine ? "primary.main" : "background.paper",
                      color: mine ? "#fff" : "text.primary",
                      border: mine ? "none" : "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {m.body}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, display: "block", mt: 0.25 }}>
                      {new Date(m.createdAt).toLocaleString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "short",
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <MessageComposer conversationId={conversationId} />
      </Box>
    </Card>
  );
}
