import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// POST /api/conversations { listingId } — tenant starts (or reopens) a chat with a landlord
export async function POST(req: NextRequest) {
  const token = req.cookies.get("strent_session")?.value;
  const session = token ? verifySession(token) : null;

  if (!session || session.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can start a conversation" }, { status: 403 });
  }

  const { listingId } = await req.json();
  if (!listingId) {
    return NextResponse.json({ error: "listingId is required" }, { status: 400 });
  }

  const conversation = await prisma.conversation.upsert({
    where: { listingId_tenantId: { listingId, tenantId: session.userId } },
    update: {},
    create: { listingId, tenantId: session.userId }
  });

  return NextResponse.json(conversation, { status: 201 });
}

// GET /api/conversations — list the current user's threads (tenant view)
export async function GET(req: NextRequest) {
  const token = req.cookies.get("strent_session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { tenantId: session.userId },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(conversations);
}
