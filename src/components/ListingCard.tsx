import Link from "next/link";
import Image from "next/image";
import type { ListingSummary } from "@/types";
import Stamp from "@/components/Stamp";

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
<<<<<<< HEAD
      className="group block overflow-hidden border-2 border-ink bg-paper transition hover:shadow-[4px_4px_0_0_#211D16]"
=======
      className="group block overflow-hidden rounded-2xl border border-ink/10 bg-paper shadow-card transition-all duration-200 ease-smooth hover:-translate-y-1 hover:shadow-card-hover"
>>>>>>> master
    >
      <div className="relative h-44 w-full bg-mute/20">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
<<<<<<< HEAD
            className="object-cover"
=======
            className="object-cover transition-transform duration-300 ease-smooth group-hover:scale-105"
>>>>>>> master
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-mute">
            No photo yet
          </div>
        )}
        <Stamp className="absolute -top-1 left-3" />
      </div>
      <div className="p-4">
        <p className="font-display text-lg font-semibold text-ink">{listing.title}</p>
        <p className="text-sm text-mute">{listing.address}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="font-mono text-sm font-semibold text-clay">
            KES {listing.price.toLocaleString()}/mo
          </span>
          <span className="text-sm text-mute">
            {listing.bedrooms} bd · {listing.bathrooms} ba
          </span>
        </div>
      </div>
    </Link>
  );
}