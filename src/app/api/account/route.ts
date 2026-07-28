import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { getSessionUser } from "@/lib/security/currentUser";
import { SESSION_COOKIE } from "@/lib/security/sessionManager";

export async function DELETE(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { password } = await req.json();
  if (!password) {
    return NextResponse.json({ error: "Enter your password to confirm account deletion" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Schema-level onDelete: Cascade removes listings, images, conversations,
  // messages, bookings, sessions, and tokens tied to this user in one go.
  await prisma.user.delete({ where: { id: user.id } });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
