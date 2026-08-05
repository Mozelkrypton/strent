import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

// POST /api/conversations { listingId } — tenant starts (or reopens) a chat with a landlord
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);

  if (!session || session.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can start a conversation" }, { status: 403 });
  }

  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const conversation = await prisma.conversation.upsert({
    where: { listingId_tenantId: { listingId, tenantId: session.userId } },
    update: {},
    create: { listingId, tenantId: session.userId }
  });

  return NextResponse.json(conversation, { status: 201 });
}

// GET /api/conversations — the signed-in user's threads. Tenants see
// conversations they started; landlords see conversations about any of
// their listings. Same endpoint, branched by role, since "my inbox" means
// something different depending which side of the chat you're on.
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where:
      session.role === "LANDLORD"
        ? { listing: { landlordId: session.userId } }
        : { tenantId: session.userId },
    include: {
      listing: { select: { id: true, title: true, price: true, landlordId: true, landlord: { select: { name: true } } } },
      tenant: { select: { id: true, name: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  const withUnread = await Promise.all(
    conversations.map(async (c) => {
      const unreadCount = await prisma.message.count({
        where: { conversationId: c.id, senderId: { not: session.userId }, readAt: null }
      });
      return {
        id: c.id,
        listing: { id: c.listing.id, title: c.listing.title, price: c.listing.price },
        otherParty: session.role === "LANDLORD" ? c.tenant.name : c.listing.landlord.name,
        lastMessage: c.messages[0]?.content ?? null,
        lastMessageAt: c.messages[0]?.createdAt ?? c.createdAt,
        unreadCount
      };
    })
  );

  return NextResponse.json(withUnread);
}
