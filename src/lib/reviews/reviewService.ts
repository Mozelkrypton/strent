import { prisma } from "@/lib/prisma";
import { RATING_CATEGORIES, computeOverall, type CategoryRatings } from "./categories";

export type SubmitReviewInput = {
  listingId: string;
  tenantId: string;
  ratings: CategoryRatings;
  comment?: string | null;
};

export class ReviewService {
  /** Creates or updates the tenant's single review for a listing, then
   * recomputes that listing's cached averages. */
  async submitReview({ listingId, tenantId, ratings, comment }: SubmitReviewInput) {
    const data = {
      ratingLocation: ratings.location,
      ratingValue: ratings.value,
      ratingCondition: ratings.condition,
      ratingUtilities: ratings.utilities,
      ratingLandlord: ratings.landlord,
      comment: comment ?? null
    };

    const review = await prisma.review.upsert({
      where: { listingId_tenantId: { listingId, tenantId } },
      create: { listingId, tenantId, ...data },
      update: data
    });

    await this.recomputeAggregates(listingId);
    return review;
  }

  async deleteReview(listingId: string, tenantId: string): Promise<void> {
    await prisma.review
      .delete({ where: { listingId_tenantId: { listingId, tenantId } } })
      .catch(() => {
        /* nothing to delete — fine, this is idempotent */
      });
    await this.recomputeAggregates(listingId);
  }

  async listForListing(listingId: string) {
    return prisma.review.findMany({
      where: { listingId },
      orderBy: { createdAt: "desc" },
      include: { tenant: { select: { id: true, name: true } } }
    });
  }

  async getTenantReview(listingId: string, tenantId: string) {
    return prisma.review.findUnique({ where: { listingId_tenantId: { listingId, tenantId } } });
  }

  /** Recomputes and stores per-category + overall averages on the Listing row,
   * so browse/sort never has to average Review rows on the read path. */
  private async recomputeAggregates(listingId: string): Promise<void> {
    const reviews = await prisma.review.findMany({ where: { listingId } });

    if (reviews.length === 0) {
      await prisma.listing.update({
        where: { id: listingId },
        data: {
          avgRating: null,
          avgRatingLocation: null,
          avgRatingValue: null,
          avgRatingCondition: null,
          avgRatingUtilities: null,
          avgRatingLandlord: null,
          reviewCount: 0
        }
      });
      return;
    }

    const averageOf = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

    const perCategory: Record<string, number> = {};
    for (const category of RATING_CATEGORIES) {
      perCategory[category.key] = averageOf(reviews.map((r) => r[category.field as keyof typeof r] as number));
    }

    const overall = averageOf(
      reviews.map((r) =>
        computeOverall({
          location: r.ratingLocation,
          value: r.ratingValue,
          condition: r.ratingCondition,
          utilities: r.ratingUtilities,
          landlord: r.ratingLandlord
        })
      )
    );

    await prisma.listing.update({
      where: { id: listingId },
      data: {
        avgRating: overall,
        avgRatingLocation: perCategory.location,
        avgRatingValue: perCategory.value,
        avgRatingCondition: perCategory.condition,
        avgRatingUtilities: perCategory.utilities,
        avgRatingLandlord: perCategory.landlord,
        reviewCount: reviews.length
      }
    });
  }
}

export const reviewService = new ReviewService();
