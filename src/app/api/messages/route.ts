import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";

// GET /api/messages?conversationId=...
export async function GET(req: NextRequest) {
  const token = req.cookies.get("strent_session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}

// POST /api/messages { conversationId, content }
export async function POST(req: NextRequest) {
  const token = req.cookies.get("strent_session")?.value;
  const session = token ? verifySession(token) : null;
  if (!session) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { conversationId, content } = await req.json();
  if (!conversationId || !content?.trim()) {
    return NextResponse.json({ error: "conversationId and content are required" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { conversationId, senderId: session.userId, content: content.trim() }
  });

  return NextResponse.json(message, { status: 201 });
}
