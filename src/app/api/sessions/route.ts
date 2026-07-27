import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/security/currentUser";
import { sessionManager } from "@/lib/security/sessionManager";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const sessions = await sessionManager.listActive(session.userId);
  return NextResponse.json(sessions);
}
