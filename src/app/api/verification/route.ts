import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { verified: true } });

  const latest = await prisma.verificationRequest.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({
    verified: user?.verified ?? false,
    request: latest
      ? {
          status: latest.status,
          rejectionReason: latest.rejectionReason,
          createdAt: latest.createdAt,
          reviewedAt: latest.reviewedAt
        }
      : null
  });
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can request verification" }, { status: 403 });
  }

  const existingPending = await prisma.verificationRequest.findFirst({
    where: { userId: session.userId, status: "PENDING" }
  });
  if (existingPending) {
    return NextResponse.json({ error: "You already have a verification request pending review" }, { status: 409 });
  }

  const { idDocumentUrl, ownershipDocumentUrl, note } = await req.json();
  if (!idDocumentUrl || !ownershipDocumentUrl) {
    return NextResponse.json(
      { error: "Both an ID document and a proof-of-ownership document are required" },
      { status: 400 }
    );
  }

  const request = await prisma.verificationRequest.create({
    data: {
      userId: session.userId,
      idDocumentUrl,
      ownershipDocumentUrl,
      note: note || null
    }
  });

  return NextResponse.json({ ok: true, requestId: request.id }, { status: 201 });
}
