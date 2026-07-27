import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { EmailVerificationService } from "@/lib/security/expiringTokenService";

const emailVerification = new EmailVerificationService();

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

  const token = await emailVerification.issue(user.id);
  console.log(`[email-verification] ${user.email} -> /verify-email?token=${token}`);

  return NextResponse.json({ ok: true });
}
