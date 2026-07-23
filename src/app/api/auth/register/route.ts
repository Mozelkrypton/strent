import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { name, email, password, role, phone } = await req.json();

  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: "name, email, password, and role are required" }, { status: 400 });
  }
  if (!["TENANT", "LANDLORD"].includes(role)) {
    return NextResponse.json({ error: "role must be TENANT or LANDLORD" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists" }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash, role }
  });

  const token = signSession({ userId: user.id, role: user.role });
  const res = NextResponse.json({ id: user.id, name: user.name, role: user.role }, { status: 201 });
  res.cookies.set("strent_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}
