import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PasswordResetService } from "@/lib/security/expiringTokenService";

const passwordReset = new PasswordResetService();

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  // Only issue a token if the account exists, but respond identically
  // either way — otherwise this endpoint becomes a "does this email have
  // an account" oracle for an attacker.
  if (user) {
    const token = await passwordReset.issue(user.id);
    console.log(`[password-reset] ${user.email} -> /reset-password?token=${token}`);
  }

  return NextResponse.json({
    ok: true,
    message: "If an account exists for that email, a reset link has been sent."
  });
}
