import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/security/authService";
import { SESSION_COOKIE } from "@/lib/security/sessionManager";

export async function POST(req: NextRequest) {
  const { challengeToken, code } = await req.json();
  if (!challengeToken || !code) {
    return NextResponse.json({ error: "challengeToken and code are required" }, { status: 400 });
  }

  const result = await authService.completeTwoFactor(challengeToken, code, req);
  if (result.status === "invalid") {
    return NextResponse.json({ error: "Invalid or expired code" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, result.sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
