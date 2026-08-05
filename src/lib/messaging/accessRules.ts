export type ConversationShape = {
  tenantId: string;
  listing: { landlordId: string };
};

/**
 * Who is this conversation open to? The tenant who started it, the landlord
 * whose listing it's about, or an admin — nobody else, not even a different
 * tenant or a different landlord. Kept dependency-free (no Prisma import)
 * so this decision is directly testable without a database.
 */
export function resolveAccessRole(
  conversation: ConversationShape,
  userId: string,
  isAdmin: boolean
): "tenant" | "landlord" | null {
  if (conversation.tenantId === userId) return "tenant";
  if (conversation.listing.landlordId === userId) return "landlord";
  if (isAdmin) return "landlord";
  return null;
}
