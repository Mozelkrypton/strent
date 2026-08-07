import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { checkConversationAccess } from "@/lib/messaging/conversationAccess";

// GET /api/messages?conversationId=...
export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const access = await checkConversationAccess(conversationId, session.userId, session.role === "ADMIN");
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "not-found" ? "Conversation not found" : "Not your conversation" },
      { status: access.reason === "not-found" ? 404 : 403 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { conversationId, NOT: { deletedFor: { has: session.userId } } },
    orderBy: { createdAt: "asc" },
    select: { id: true, conversationId: true, senderId: true, content: true, readAt: true, createdAt: true }
  });

  // Mark the other person's messages as read now that this participant has
  // fetched them — cheap, fire-and-forget, don't block the response on it.
  prisma.message
    .updateMany({
      where: { conversationId, senderId: { not: session.userId }, readAt: null },
      data: { readAt: new Date() }
    })
    .catch(() => {});

  return NextResponse.json(messages);
}

// POST /api/messages { conversationId, content }
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { conversationId, content } = await req.json();
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "conversationId and content are required" }, { status: 400 });
  }

  const access = await checkConversationAccess(conversationId, session.userId, session.role === "ADMIN");
  if (!access.ok) {
    return NextResponse.json(
      { error: access.reason === "not-found" ? "Conversation not found" : "Not your conversation" },
      { status: access.reason === "not-found" ? 404 : 403 }
    );
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: session.userId, content: content.trim().slice(0, 4000) }
  });

  return NextResponse.json(message, { status: 201 });
}

// DELETE /api/messages?id=... — "delete for me" only. Hides this message
// from the requester's own view; the other participant still sees it in
// full, and nothing is ever actually erased from the database.
export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const message = await prisma.message.findUnique({
    where: { id },
    select: { conversationId: true, deletedFor: true }
  });
  if (!message) return NextResponse.json({ error: "Message not found" }, { status: 404 });

  const access = await checkConversationAccess(message.conversationId, session.userId, session.role === "ADMIN");
  if (!access.ok) {
    return NextResponse.json({ error: "Not your conversation" }, { status: 403 });
  }

  if (!message.deletedFor.includes(session.userId)) {
    await prisma.message.update({
      where: { id },
      data: { deletedFor: { push: session.userId } }
    });
  }

  return NextResponse.json({ ok: true });
}
