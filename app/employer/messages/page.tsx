import Typography from "@mui/material/Typography";
import { requireRole } from "@/lib/session";
import { listConversations } from "@/lib/messaging";
import ConversationList from "@/components/messaging/ConversationList";
import { PageTransition } from "@/components/motion";

export default async function EmployerMessagesPage() {
  const user = await requireRole("EMPLOYER");
  const items = await listConversations(user.id);
  return (
    <PageTransition sx={{ maxWidth: 720, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Messages
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Message workers you&apos;re considering. Contact details are shared only after hiring.
      </Typography>
      <ConversationList items={items} basePath="/employer/messages" />
    </PageTransition>
  );
}
