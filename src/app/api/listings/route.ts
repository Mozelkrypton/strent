import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";

// GET /api/listings?minPrice=&maxPrice=&bedrooms=&lat=&lng=&radiusKm=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");

  const listings = await prisma.listing.findMany({
    where: {
      status: "AVAILABLE",
      ...(minPrice ? { price: { gte: Number(minPrice) } } : {}),
      ...(maxPrice ? { price: { lte: Number(maxPrice) } } : {}),
      ...(bedrooms ? { bedrooms: Number(bedrooms) } : {})
    },
    include: { images: { take: 1 }, landlord: { select: { verified: true } } },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json(
    listings.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      address: l.address,
      latitude: l.latitude,
      longitude: l.longitude,
      coverImageUrl: l.images[0]?.url ?? null,
      landlordVerified: l.landlord.verified
    }))
  );
}

// POST /api/listings — landlord creates a listing
export async function POST(req: NextRequest) {
  const session = await getSessionUser(req);

  if (!session || session.role !== "LANDLORD") {
    return NextResponse.json({ error: "Only landlords can create listings" }, { status: 403 });
  }

  const body = await req.json();
  const { title, description, price, bedrooms, bathrooms, address, latitude, longitude, imageUrls } = body;

  if (!title || !description || !price || !address || latitude == null || longitude == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const listing = await prisma.listing.create({
    data: {
      title,
      description,
      price,
      bedrooms: bedrooms ?? 1,
      bathrooms: bathrooms ?? 1,
      address,
      latitude,
      longitude,
      landlordId: session.userId,
      images: {
        create: (imageUrls as string[] | undefined)?.map((url) => ({ url })) ?? []
      }
    }
  });

  return NextResponse.json(listing, { status: 201 });
}
