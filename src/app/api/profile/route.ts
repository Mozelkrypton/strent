import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

// Fields every role is allowed to edit about themselves. Email isn't in
// this list on purpose — changing it should go through a re-verification
// flow (reusing EmailVerificationService) rather than a plain field update.
const EDITABLE_FIELDS = ["name", "phone", "bio", "avatarUrl"] as const;

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      bio: true,
      avatarUrl: true,
      role: true,
      adminLevel: true,
      verified: true,
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: true
    }
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const data: Record<string, string | null> = {};

  for (const field of EDITABLE_FIELDS) {
    if (field in body) {
      const value = body[field];
      if (value !== null && typeof value !== "string") {
        return NextResponse.json({ error: `${field} must be a string` }, { status: 400 });
      }
      data[field] = value;
    }
  }

  if (typeof data.name === "string" && data.name.trim().length === 0) {
    return NextResponse.json({ error: "Name can't be empty" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.userId },
    data,
    select: { id: true, name: true, phone: true, bio: true, avatarUrl: true }
  });

  return NextResponse.json(user);
}
