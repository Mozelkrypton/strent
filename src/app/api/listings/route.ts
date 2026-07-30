import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { SORT_OPTIONS, type SortKey } from "@/lib/reviews/categories";

const SORT_FIELD: Record<SortKey, string> = {
  overall: "avgRating",
  location: "avgRatingLocation",
  value: "avgRatingValue",
  condition: "avgRatingCondition",
  utilities: "avgRatingUtilities",
  landlord: "avgRatingLandlord"
};

// GET /api/listings?minPrice=&maxPrice=&bedrooms=&sortBy=overall|location|value|condition|utilities|landlord
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const bedrooms = searchParams.get("bedrooms");
  const sortByParam = searchParams.get("sortBy");
  const sortBy: SortKey = SORT_OPTIONS.some((o) => o.key === sortByParam) ? (sortByParam as SortKey) : "overall";

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

  const sortField = SORT_FIELD[sortBy] as keyof (typeof listings)[number];

  // Rated listings first (highest first), unrated ones after — sorted here in
  // JS rather than trusting DB-level null ordering, which differs by column
  // direction and isn't worth debugging blind for a dataset this size.
  const sorted = [...listings].sort((a, b) => {
    const av = a[sortField] as number | null;
    const bv = b[sortField] as number | null;
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return bv - av;
  });

  return NextResponse.json(
    sorted.map((l) => ({
      id: l.id,
      title: l.title,
      price: l.price,
      bedrooms: l.bedrooms,
      bathrooms: l.bathrooms,
      address: l.address,
      latitude: l.latitude,
      longitude: l.longitude,
      coverImageUrl: l.images[0]?.url ?? null,
      landlordVerified: l.landlord.verified,
      avgRating: l.avgRating,
      reviewCount: l.reviewCount
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
