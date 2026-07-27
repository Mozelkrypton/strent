import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { PasswordResetService } from "@/lib/security/expiringTokenService";
import { sessionManager } from "@/lib/security/sessionManager";
import { auditLogger } from "@/lib/security/auditLogger";

const passwordReset = new PasswordResetService();

export async function POST(req: NextRequest) {
  const { token, password } = await req.json();
  if (!token || !password) {
    return NextResponse.json({ error: "Token and new password are required" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const consumed = await passwordReset.consume(token);
  if (!consumed) {
    return NextResponse.json({ error: "That reset link is invalid or has expired" }, { status: 400 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.update({
    where: { id: consumed.userId },
    data: { passwordHash, failedLoginAttempts: 0, lockedUntil: null }
  });

  // A password reset is a good moment to sign every device out — if the
  // reset happened because the old password leaked, this cuts off anyone
  // already using it.
  await sessionManager.revokeAllForUser(user.id);
  await auditLogger.logLogin({ userId: user.id, email: user.email, success: true, reason: "password_reset", req });

  return NextResponse.json({ ok: true });
}
