import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { sessionManager, SESSION_COOKIE } from "@/lib/security/sessionManager";
import { EmailVerificationService } from "@/lib/security/expiringTokenService";

const emailVerification = new EmailVerificationService();

export async function POST(req: NextRequest) {
  const { name, email, password, role, phone } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
  }
  if (!["TENANT", "LANDLORD"].includes(role)) {
    return NextResponse.json({ error: "role must be TENANT or LANDLORD" }, { status: 400 });
  }
  if (typeof password !== "string" || password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email: normalizedEmail, phone, passwordHash, role }
  });

  // Email delivery isn't wired up yet — log the verification link so it's
  // usable in dev. Swap this for a real mailer later without touching the
  // token logic itself.
  const verificationToken = await emailVerification.issue(user.id);
  console.log(
    `[email-verification] ${user.email} -> /verify-email?token=${verificationToken}`
  );

  const sessionToken = await sessionManager.create(user.id, req);
  const res = NextResponse.json(
    { id: user.id, name: user.name, role: user.role, emailVerified: false },
    { status: 201 }
  );
  res.cookies.set(SESSION_COOKIE, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
