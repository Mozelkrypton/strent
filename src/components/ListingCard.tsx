import Link from "next/link";
import Image from "next/image";
import type { ListingSummary } from "@/types";

export default function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={`/listings/${listing.id}`}
      className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white transition hover:shadow-md"
    >
      <div className="relative h-44 w-full bg-neutral-100">
        {listing.coverImageUrl ? (
          <Image
            src={listing.coverImageUrl}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No photo yet
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="font-medium text-neutral-900">{listing.title}</p>
        <p className="text-sm text-neutral-500">{listing.address}</p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold text-brand-600">
            KES {listing.price.toLocaleString()}/mo
          </span>
          <span className="text-neutral-500">
            {listing.bedrooms} bd · {listing.bathrooms} ba
          </span>
        </div>
      </div>
    </Link>
  );
}