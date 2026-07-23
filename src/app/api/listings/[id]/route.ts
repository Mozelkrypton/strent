import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    bathrooms: listing.bathrooms,
    address: listing.address,
    latitude: listing.latitude,
    longitude: listing.longitude,
    status: listing.status,
    coverImageUrl: listing.images[0]?.url ?? null,
    images: listing.images.map((i) => ({ id: i.id, url: i.url })),
    landlord: listing.landlord
  });
}
