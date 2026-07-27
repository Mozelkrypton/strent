import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/security/currentUser";
import { sessionManager } from "@/lib/security/sessionManager";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await sessionManager.revokeById(params.id, session.userId);
  return NextResponse.json({ ok: true });
}
