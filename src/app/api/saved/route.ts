import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { unitTypeLabel } from "@/lib/units";

export async function GET(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const saved = await prisma.savedListing.findMany({
    where: { tenantId: session.userId },
    orderBy: { createdAt: "desc" },
    include: { listing: { include: { images: { take: 1 } } } }
  });

  return NextResponse.json(
    saved.map((s) => ({
      savedId: s.id,
      listingId: s.listing.id,
      title: s.listing.title,
      price: s.listing.price,
      unitTypeLabel: unitTypeLabel(s.listing.unitType) || `${s.listing.bedrooms} bed`,
      address: s.listing.address,
      status: s.listing.status,
      coverImageUrl: s.listing.images[0]?.url ?? null
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can save listings" }, { status: 403 });
  }

  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: "listingId is required" }, { status: 400 });

  const listing = await prisma.listing.findUnique({ where: { id: listingId } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  // Idempotent — saving something already saved is a no-op success, not an error.
  await prisma.savedListing.upsert({
    where: { tenantId_listingId: { tenantId: session.userId, listingId } },
    create: { tenantId: session.userId, listingId },
    update: {}
  });

  return NextResponse.json({ ok: true, saved: true });
}
