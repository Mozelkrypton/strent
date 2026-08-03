import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

export async function DELETE(req: NextRequest, { params }: { params: { listingId: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await prisma.savedListing
    .delete({ where: { tenantId_listingId: { tenantId: session.userId, listingId: params.listingId } } })
    .catch(() => {
      /* already not saved — fine, this is idempotent */
    });

  return NextResponse.json({ ok: true, saved: false });
}
