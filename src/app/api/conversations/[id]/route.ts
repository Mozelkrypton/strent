import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/security/currentUser";
import { checkConversationAccess } from "@/lib/messaging/conversationAccess";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const access = await checkConversationAccess(params.id, session.userId, session.role === "ADMIN");
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "not-found" ? "Conversation not found" : "Not your conversation" },
      { status: access.reason === "not-found" ? 404 : 403 }
    );
  }

  const { conversation, role } = access;
  return NextResponse.json({
    id: conversation.id,
    listing: { id: conversation.listing.id, title: conversation.listing.title },
    otherParty: role === "tenant" ? conversation.listing.landlord.name : conversation.tenant.name
  });
}
