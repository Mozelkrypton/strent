import Image from "next/image";
import { notFound } from "next/navigation";
import MapView from "@/components/MapView";
import VerifiedBadge from "@/components/VerifiedBadge";
import StarRating from "@/components/StarRating";
import ReviewsSection from "@/components/ReviewsSection";
import SaveButton from "@/components/SaveButton";
import BookingButton from "@/components/BookingButton";
import type { ListingDetail } from "@/types";

async function getListing(id: string): Promise<ListingDetail | null> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/listings/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  const [heroImage, ...restImages] = listing.images;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{listing.title}</h1>
      <div className="mt-1 flex items-center gap-2 text-mute">
        <span>{listing.address}</span>
        {listing.ratings.count > 0 && (
          <>
            <span className="text-mute/50">·</span>
            <StarRating value={listing.ratings.overall ?? 0} size="sm" />
            <span className="text-sm">
              {listing.ratings.overall?.toFixed(1)} ({listing.ratings.count})
            </span>
          </>
        )}
      </div>

      {heroImage && (
        <div className="mt-6 grid grid-cols-4 gap-2 sm:grid-rows-2">
          <div className="relative col-span-4 h-64 overflow-hidden rounded-3xl bg-mute/10 shadow-card sm:col-span-2 sm:row-span-2 sm:h-full">
            <Image
              src={heroImage.url}
              alt={listing.title}
              fill
              sizes="(min-width: 640px) 50vw, 100vw"
              className="object-cover"
              priority
            />
          </div>
          {restImages.slice(0, 4).map((img) => (
            <div key={img.id} className="relative col-span-2 h-32 overflow-hidden rounded-2xl bg-mute/10 shadow-sm sm:col-span-1 sm:h-full">
              <Image
                src={img.url}
                alt={listing.title}
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-3xl bg-surface p-5 shadow-card">
        <div>
          <p className="font-mono text-2xl font-bold text-ink">
            KES {listing.price.toLocaleString()}
            <span className="font-body text-base font-normal text-mute"> /month</span>
          </p>
          <p className="mt-0.5 text-sm text-mute">
            {listing.bedrooms} bed · {listing.bathrooms} bath
          </p>
        </div>
        <div className="flex items-center gap-3">
          <SaveButton listingId={listing.id} />
          <span className="rounded-full bg-primary-light px-3.5 py-1.5 text-sm font-semibold text-primary-dark">
            {listing.status === "AVAILABLE" ? "Available now" : listing.status}
          </span>
        </div>
      </div>

      <p className="mt-6 whitespace-pre-line leading-relaxed text-ink/80">{listing.description}</p>

      <h2 className="mt-10 font-display text-lg font-bold text-ink">Location</h2>
      <div className="mt-3">
        <MapView latitude={listing.latitude} longitude={listing.longitude} label={listing.title} />
      </div>

      <div className="mt-10 flex items-center gap-3 border-t border-ink/5 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-mute/10 font-display text-base font-bold text-ink">
          {listing.landlord.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-display text-base font-semibold text-ink">{listing.landlord.name}</p>
          {listing.landlord.verified && <VerifiedBadge className="mt-1" />}
        </div>
      </div>

      <div className="mt-4">
        <BookingButton listingId={listing.id} price={listing.price} />
      </div>

      <p className="mt-3 text-sm text-mute">
        Sign in as a tenant to message this landlord about viewing, price, or booking.
      </p>
      {/* Once signed in, this becomes: create a Conversation via POST /api/conversations,
          then render <ChatPanel conversationId={...} /> here. */}

      <ReviewsSection listingId={listing.id} ratings={listing.ratings} />
    </div>
  );
}
