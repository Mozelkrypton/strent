import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const validStatus = status === "PENDING" || status === "APPROVED" || status === "REJECTED" ? status : "PENDING";

  const requests = await prisma.verificationRequest.findMany({
    where: { status: validStatus },
    orderBy: { createdAt: "asc" }, // oldest first — first in line gets reviewed first
    include: { user: { select: { id: true, name: true, email: true } } }
  });

  return NextResponse.json(requests);
}
