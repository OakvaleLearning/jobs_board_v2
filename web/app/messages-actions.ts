"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser, roleHome } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { notify } from "@/lib/notifications";
import { containsContactInfo, getOrCreateConversation } from "@/lib/messaging";
import type { FormState } from "@/lib/forms";

/** Employer starts (or reopens) a conversation with a worker, then opens the thread. */
export async function startConversationWithWorker(workerProfileId: string) {
  const user = await requireUser();
  if (user.role !== "EMPLOYER") redirect(roleHome(user.role));

  const worker = await prisma.workerProfile.findUnique({
    where: { id: workerProfileId },
    select: { userId: true },
  });
  if (!worker) redirect("/employer/workers");

  const conversation = await getOrCreateConversation(worker.userId, user.id);
  redirect(`/employer/messages/${conversation.id}`);
}

export async function sendMessage(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const conversationId = String(formData.get("conversationId") || "");
  const body = String(formData.get("body") || "").trim();

  if (!body) return { ok: false, message: "Write a message first." };
  if (containsContactInfo(body)) {
    return {
      ok: false,
      message:
        "For everyone's safety, phone numbers and emails can't be shared here. Oakvale releases contact details when a placement is confirmed.",
    };
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ workerUserId: user.id }, { employerUserId: user.id }],
    },
  });
  if (!conversation) return { ok: false, message: "Conversation not found." };

  await prisma.message.create({ data: { conversationId, senderId: user.id, body } });
  await prisma.conversation.update({ where: { id: conversationId }, data: { updatedAt: new Date() } });
  await audit({ userId: user.id, action: "message.sent", entityType: "Conversation", entityId: conversationId });

  const recipientId =
    conversation.workerUserId === user.id ? conversation.employerUserId : conversation.workerUserId;
  const recipientBase =
    conversation.workerUserId === recipientId ? "/worker/messages" : "/employer/messages";
  await notify({
    userId: recipientId,
    type: "message.received",
    title: `New message from ${user.name}`,
    body: body.length > 80 ? `${body.slice(0, 80)}…` : body,
    link: `${recipientBase}/${conversationId}`,
  });

  revalidatePath(`/worker/messages/${conversationId}`);
  revalidatePath(`/employer/messages/${conversationId}`);
  return { ok: true };
}
