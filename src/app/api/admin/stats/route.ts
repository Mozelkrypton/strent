import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { requireAdmin } from "@/lib/admin/requireAdmin";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  const gate = requireAdmin(session);
  if (!gate.ok) return gate.response;

  const [tenantCount, landlordCount, adminCount, listingCount, pendingVerifications, suspendedCount] =
    await Promise.all([
      prisma.user.count({ where: { role: "TENANT" } }),
      prisma.user.count({ where: { role: "LANDLORD" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.listing.count(),
      prisma.verificationRequest.count({ where: { status: "PENDING" } }),
      prisma.user.count({ where: { suspended: true } })
    ]);

  return NextResponse.json({
    users: { tenants: tenantCount, landlords: landlordCount, admins: adminCount, suspended: suspendedCount },
    listings: listingCount,
    pendingVerifications
  });
}
