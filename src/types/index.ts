import type { RatingCategoryKey } from "@/lib/reviews/categories";

export type ListingSummary = {
  id: string;
  title: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  address: string;
  latitude: number;
  longitude: number;
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