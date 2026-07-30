import { notFound } from "next/navigation";
import { requireRole } from "@/lib/session";
import { getConversationForUser } from "@/lib/messaging";
import Thread from "@/components/messaging/Thread";
import LinkButton from "@/components/LinkButton";
import { PageTransition } from "@/components/motion";

export default async function EmployerThreadPage({ params }: PageProps<"/employer/messages/[id]">) {
  const user = await requireRole("EMPLOYER");
  const { id } = await params;
  const data = await getConversationForUser(id, user.id);
  if (!data) notFound();

  return (
    <PageTransition sx={{ maxWidth: 720, mx: "auto" }}>
      <LinkButton href="/employer/messages" color="inherit" size="small" sx={{ mb: 2 }}>
        ← All messages
      </LinkButton>
      <Thread
        conversationId={data.conversation.id}
        currentUserId={user.id}
        otherName={data.other?.name ?? "Worker"}
        otherRole={data.other?.role ?? "WORKER"}
        messages={data.conversation.messages}
      />
    </PageTransition>
  );
}
