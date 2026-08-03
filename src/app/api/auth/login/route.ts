import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/security/authService";
import { SESSION_COOKIE } from "@/lib/security/sessionManager";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }

  const result = await authService.login(email, password, req);

  switch (result.status) {
    case "ok": {
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

    case "2fa_required":
      return NextResponse.json({ twoFactorRequired: true, challengeToken: result.challengeToken });

    case "locked": {
      const minutes = Math.max(1, Math.ceil((result.lockedUntil.getTime() - Date.now()) / 60000));
      return NextResponse.json(
        { error: `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}.` },
        { status: 423 }
      );
    }

    case "suspended":
      return NextResponse.json(
        { error: "This account has been suspended. Contact support if you think this is a mistake." },
        { status: 403 }
      );

    case "rate_limited": {
      const seconds = Math.max(1, Math.ceil((result.retryAfterMs ?? 0) / 1000));
      return NextResponse.json(
        { error: `Too many attempts. Try again in ${seconds}s.` },
        { status: 429 }
      );
    }

    case "invalid":
    default:
      // Deliberately generic — never reveal whether the email or the password was wrong.
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
}
