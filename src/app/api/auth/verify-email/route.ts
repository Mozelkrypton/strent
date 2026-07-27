import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { EmailVerificationService } from "@/lib/security/expiringTokenService";

const emailVerification = new EmailVerificationService();

export async function POST(req: NextRequest) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token is required" }, { status: 400 });

  const consumed = await emailVerification.consume(token);
  if (!consumed) {
    return NextResponse.json({ error: "That verification link is invalid or has expired" }, { status: 400 });
  }

  await prisma.user.update({ where: { id: consumed.userId }, data: { emailVerified: true } });
  return NextResponse.json({ ok: true });
}
