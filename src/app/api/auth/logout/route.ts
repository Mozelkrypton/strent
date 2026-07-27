import { NextRequest, NextResponse } from "next/server";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";

export async function POST(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    await sessionManager.revokeByToken(token);
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
