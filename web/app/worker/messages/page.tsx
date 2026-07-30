import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { listConversations } from "@/lib/messaging";
import ConversationList from "@/components/messaging/ConversationList";
import { PageTransition } from "@/components/motion";

export default async function WorkerMessagesPage() {
  const user = await requireRole("WORKER");
  const items = await listConversations(user.id);
  return (
    <PageTransition sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Chat with employers. Oakvale can see all messages for your safety.
      </Typography>
      <ConversationList items={items} basePath="/worker/messages" />
    </PageTransition>
  );
}
