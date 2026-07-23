import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email and password are required" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    // Same message for both cases on purpose — don't reveal which part was wrong.
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = signSession({ userId: user.id, role: user.role });
  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role });
  res.cookies.set("strent_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
