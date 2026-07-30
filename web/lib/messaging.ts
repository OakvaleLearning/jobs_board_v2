import { prisma } from "@/lib/prisma";

/** Blocks sharing of direct contact details in mediated messages. */
const PHONE_RE = /(\+?\d[\d\s-]{6,}\d)/;
const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i;

export function containsContactInfo(text: string): boolean {
  return PHONE_RE.test(text) || EMAIL_RE.test(text);
}

/** Finds or creates the single conversation between a worker and an employer user. */
export async function getOrCreateConversation(workerUserId: string, employerUserId: string) {
  const existing = await prisma.conversation.findFirst({
    where: { workerUserId, employerUserId, jobId: null },
  });
  if (existing) return existing;
  return prisma.conversation.create({ data: { workerUserId, employerUserId } });
}

/** Lists conversations for a user (either side), with the other party and last message. */
export async function listConversations(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ workerUserId: userId }, { employerUserId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const otherIds = conversations.map((c) =>
    c.workerUserId === userId ? c.employerUserId : c.workerUserId,
  );
  const others = await prisma.user.findMany({
    where: { id: { in: otherIds } },
    select: { id: true, name: true, role: true },
  });
  const byId = new Map(others.map((u) => [u.id, u]));

  return conversations.map((c) => {
    const otherId = c.workerUserId === userId ? c.employerUserId : c.workerUserId;
    return {
      id: c.id,
      other: byId.get(otherId) ?? { id: otherId, name: "Unknown", role: "WORKER" as const },
      lastMessage: c.messages[0]?.body ?? null,
      lastAt: c.messages[0]?.createdAt ?? c.updatedAt,
    };
  });
}

/** Loads a conversation the user is a participant in, with all messages. */
export async function getConversationForUser(conversationId: string, userId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      OR: [{ workerUserId: userId }, { employerUserId: userId }],
    },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });
  if (!conversation) return null;

  const otherId =
    conversation.workerUserId === userId ? conversation.employerUserId : conversation.workerUserId;
  const other = await prisma.user.findUnique({
    where: { id: otherId },
    select: { id: true, name: true, role: true },
  });
  return { conversation, other };
}
