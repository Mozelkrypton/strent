import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { adminAuditLogger } from "@/lib/admin/auditLog";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      landlord: { select: { id: true, name: true, verified: true } }
    }
  });

  if (!listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: listing.price,
    bedrooms: listing.bedrooms,
    unitType: listing.unitType,
    bathrooms: listing.bathrooms,
    address: listing.address,
    latitude: listing.latitude,
    longitude: listing.longitude,
    status: listing.status,
    coverImageUrl: listing.images[0]?.url ?? null,
    images: listing.images.map((i) => ({ id: i.id, url: i.url })),
    landlord: listing.landlord,
    ratings: {
      overall: listing.avgRating,
      location: listing.avgRatingLocation,
      value: listing.avgRatingValue,
      condition: listing.avgRatingCondition,
      utilities: listing.avgRatingUtilities,
      landlord: listing.avgRatingLandlord,
      count: listing.reviewCount
    }
  });
}

const EDITABLE_FIELDS = [
  "title",
  "description",
  "price",
  "bedrooms",
  "bathrooms",
  "address",
  "latitude",
  "longitude",
  "status"
] as const;

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (listing.landlordId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to edit this listing" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) data[field] = body[field];
  }

  const updated = await prisma.listing.update({ where: { id: params.id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  if (listing.landlordId !== session.userId && session.role !== "ADMIN") {
    return NextResponse.json({ error: "You don't have permission to delete this listing" }, { status: 403 });
  }

  const isAdminModeration = session.role === "ADMIN" && listing.landlordId !== session.userId;

  await prisma.listing.delete({ where: { id: params.id } });

  if (isAdminModeration) {
    await adminAuditLogger.log(session.userId, "listing.remove", "Listing", params.id, listing.title);
  }

  return NextResponse.json({ ok: true });
}
