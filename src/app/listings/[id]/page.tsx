import Image from "next/image";
import { notFound } from "next/navigation";
import MapView from "@/components/MapView";
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

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold">{listing.title}</h1>
      <p className="text-neutral-500">{listing.address}</p>

      {listing.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {listing.images.map((img) => (
            <div key={img.id} className="relative h-40 overflow-hidden rounded-lg bg-neutral-100">
              <Image src={img.url} alt={listing.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between rounded-lg border border-neutral-200 p-4">
        <div>
          <p className="text-xl font-semibold text-brand-600">
            KES {listing.price.toLocaleString()}/mo
          </p>
          <p className="text-sm text-neutral-500">
            {listing.bedrooms} bed · {listing.bathrooms} bath
          </p>
        </div>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-sm text-brand-600">
          {listing.status === "AVAILABLE" ? "Available now" : listing.status}
        </span>
      </div>

      <p className="mt-6 whitespace-pre-line text-neutral-700">{listing.description}</p>

      <h2 className="mt-8 text-lg font-medium">Location</h2>
      <div className="mt-2">
        <MapView latitude={listing.latitude} longitude={listing.longitude} label={listing.title} />
      </div>

      <h2 className="mt-8 text-lg font-medium">
        Landlord: {listing.landlord.name} {listing.landlord.verified && "· Verified ✓"}
      </h2>
      <p className="mt-1 text-sm text-neutral-500">
        Sign in as a tenant to message this landlord about viewing, price, or booking.
      </p>
      {/* Once signed in, this becomes: create a Conversation via POST /api/conversations,
          then render <ChatPanel conversationId={...} /> here. */}
    </div>
  );
}
