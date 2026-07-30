import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/security/currentUser";
import { reviewService } from "@/lib/reviews/reviewService";
import { RATING_CATEGORIES, isValidRating, type CategoryRatings } from "@/lib/reviews/categories";

const MAX_COMMENT_LENGTH = 1000;

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const reviews = await reviewService.listForListing(params.id);
  const session = await getSessionUser(req);

  const ownReview = session ? await reviewService.getTenantReview(params.id, session.userId) : null;

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      tenantName: r.tenant.name,
      ratingLocation: r.ratingLocation,
      ratingValue: r.ratingValue,
      ratingCondition: r.ratingCondition,
      ratingUtilities: r.ratingUtilities,
      ratingLandlord: r.ratingLandlord,
      comment: r.comment,
      createdAt: r.createdAt
    })),
    ownReview: ownReview
      ? {
          location: ownReview.ratingLocation,
          value: ownReview.ratingValue,
          condition: ownReview.ratingCondition,
          utilities: ownReview.ratingUtilities,
          landlord: ownReview.ratingLandlord,
          comment: ownReview.comment
        }
      : null
  });
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (session.role !== "TENANT") {
    return NextResponse.json({ error: "Only tenants can leave a review" }, { status: 403 });
  }

  const listing = await prisma.listing.findUnique({ where: { id: params.id } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const body = await req.json();
  const ratings: Partial<CategoryRatings> = body.ratings ?? {};

  for (const category of RATING_CATEGORIES) {
    if (!isValidRating(ratings[category.key])) {
      return NextResponse.json(
        { error: `${category.label} rating must be a whole number from 1 to 5` },
        { status: 400 }
      );
    }
  }

  const comment = typeof body.comment === "string" ? body.comment.trim().slice(0, MAX_COMMENT_LENGTH) : null;

  const review = await reviewService.submitReview({
    listingId: params.id,
    tenantId: session.userId,
    ratings: ratings as CategoryRatings,
    comment: comment || null
  });

  return NextResponse.json({ ok: true, reviewId: review.id });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSessionUser(req);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  await reviewService.deleteReview(params.id, session.userId);
  return NextResponse.json({ ok: true });
}
