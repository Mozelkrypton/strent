import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getSessionUser } from "@/lib/security/currentUser";
import { twoFactorService } from "@/lib/security/twoFactor";

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Current password is required" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  await twoFactorService.disable(session.userId);
  return NextResponse.json({ ok: true });
}
