import { prisma } from "@/lib/prisma";
import { resolveAccessRole } from "./accessRules";

export type ConversationAccess =
  | { ok: true; conversation: NonNullable<Awaited<ReturnType<typeof loadConversation>>>; role: "tenant" | "landlord" }
  | { ok: false; reason: "not-found" | "forbidden" };

async function loadConversation(conversationId: string) {
  return prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      listing: { select: { id: true, title: true, landlordId: true, landlord: { select: { name: true } } } },
      tenant: { select: { id: true, name: true } }
    }
  });
}

/**
 * The one check every messaging route needs: is this signed-in user actually
 * a participant in this conversation? Fetches the conversation, then defers
 * the actual yes/no decision to resolveAccessRole (accessRules.ts).
 */
export async function checkConversationAccess(
  conversationId: string,
  userId: string,
  isAdmin: boolean
): Promise<ConversationAccess> {
  const conversation = await loadConversation(conversationId);
  if (!conversation) return { ok: false, reason: "not-found" };

  const role = resolveAccessRole(conversation, userId, isAdmin);
  if (!role) return { ok: false, reason: "forbidden" };

  return { ok: true, conversation, role };
}

/** Total unread messages across every conversation this user is part of — for a nav badge. */
export async function getUnreadMessageCount(userId: string, role: "TENANT" | "LANDLORD" | "ADMIN"): Promise<number> {
  if (role === "ADMIN") return 0;

  return prisma.message.count({
    where: {
      senderId: { not: userId },
      readAt: null,
      conversation:
        role === "LANDLORD" ? { listing: { landlordId: userId } } : { tenantId: userId }
    }
  });
}
