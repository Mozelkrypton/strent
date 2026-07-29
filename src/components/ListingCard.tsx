import Link from "next/link";
import Image from "next/image";
import type { ListingSummary } from "@/types";
import Stamp from "@/components/Stamp";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-3xl bg-surface shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-card-hover"
    >
      <div className="relative h-52 w-full overflow-hidden bg-mute/10">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 ease-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-mute">
            No photo yet
          </div>
        )}
        <Stamp className="absolute left-3 top-3 shadow-lg" />
        {listing.landlordVerified && (
          <VerifiedBadge className="absolute right-3 top-3" label="Verified" />
        )}
      </div>
      <div className="space-y-1 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="font-display text-base font-semibold leading-snug text-ink">{listing.title}</p>
        </div>
        <p className="text-sm text-mute">{listing.address}</p>
        <div className="flex items-center gap-1.5 text-sm text-mute">
          <span>{listing.bedrooms} bd</span>
          <span className="text-mute/50">·</span>
          <span>{listing.bathrooms} ba</span>
        </div>
        <p className="pt-1 font-mono text-sm font-bold text-ink">
          KES {listing.price.toLocaleString()}
          <span className="font-body font-normal text-mute"> /month</span>
        </p>
      </div>
    </Link>
  );
}
