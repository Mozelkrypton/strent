import type { RatingCategoryKey } from "@/lib/reviews/categories";
import type { UnitTypeKey } from "@/lib/units";

export type ListingSummary = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  unitType: UnitTypeKey | null;
  bathrooms: number;
  address: string;
  latitude: number | null;
  longitude: number | null;
  coverImageUrl: string | null;
  landlordVerified: boolean;
  avgRating: number | null;
  reviewCount: number;
};

export type ListingRatings = Record<RatingCategoryKey | "overall", number | null> & { count: number };

export type ListingDetail = ListingSummary & {
  description: string;
  images: { id: string; url: string }[];
  landlord: { id: string; name: string; verified: boolean };
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
  ratings: ListingRatings;
};

export type ReviewDto = {
  id: string;
  tenantName: string;
  ratingLocation: number;
  ratingValue: number;
  ratingCondition: number;
  ratingUtilities: number;
  ratingLandlord: number;
  comment: string | null;
  createdAt: string;
};

export type MessageDto = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
};

/** Passed down from a server component that already resolved the session
 * (e.g. via getServerSession), so client components don't each independently
 * fetch /api/profile just to answer "who's signed in / what role are they". */
export type CurrentUser = { id: string; role: "TENANT" | "LANDLORD" | "ADMIN" } | null;