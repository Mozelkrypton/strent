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
};

export type ListingDetail = ListingSummary & {
  description: string;
  images: { id: string; url: string }[];
  landlord: { id: string; name: string; verified: boolean };
  status: "AVAILABLE" | "BOOKED" | "UNAVAILABLE";
};

export type MessageDto = {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
};