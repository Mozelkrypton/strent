import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";
import { adminAuditLogger } from "@/lib/admin/auditLog";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;
  const admin = session!;

  const request = await prisma.verificationRequest.findUnique({ where: { id: params.id } });
  if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
  if (request.status !== "PENDING") {
    return NextResponse.json({ error: "This request has already been reviewed" }, { status: 409 });
  }

  const { action, rejectionReason } = await req.json();
  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
  }
  if (action === "reject" && !rejectionReason) {
    return NextResponse.json({ error: "A rejection reason is required" }, { status: 400 });
  }

  await prisma.verificationRequest.update({
    where: { id: params.id },
    data: {
      status: action === "approve" ? "APPROVED" : "REJECTED",
      rejectionReason: action === "reject" ? rejectionReason : null,
      reviewedById: admin.userId,
      reviewedAt: new Date()
    }
  });

  if (action === "approve") {
    await prisma.user.update({ where: { id: request.userId }, data: { verified: true } });
  }

  await adminAuditLogger.log(
    admin.userId,
    `verification.${action}`,
    "VerificationRequest",
    request.id,
    action === "reject" ? rejectionReason : undefined
  );

  return NextResponse.json({ ok: true });
}
