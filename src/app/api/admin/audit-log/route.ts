import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;

  const entries = await prisma.adminActionLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { admin: { select: { name: true, email: true } } }
  });

  return NextResponse.json(entries);
}
