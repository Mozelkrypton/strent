import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      adminLevel: true,
      verified: true,
      suspended: true,
      twoFactorEnabled: true,
      createdAt: true
    }
  });

  return NextResponse.json(users);
}
