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
      <h1 className="font-display text-3xl font-bold text-ink">{listing.title}</h1>
      <p className="text-mute">{listing.address}</p>

      {listing.images.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {listing.images.map((img) => (
            <div key={img.id} className="relative h-40 overflow-hidden border-2 border-ink bg-mute/20">
              <Image src={img.url} alt={listing.title} fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center justify-between border-2 border-ink bg-white p-4">
        <div>
          <p className="font-mono text-xl font-semibold text-clay">
            KES {listing.price.toLocaleString()}/mo
          </p>
          <p className="text-sm text-mute">
            {listing.bedrooms} bed · {listing.bathrooms} bath
          </p>
        </div>
        <span className="border-2 border-ink bg-leaf px-3 py-1 text-sm font-medium text-paper">
          {listing.status === "AVAILABLE" ? "Available now" : listing.status}
        </span>
      </div>

      <p className="mt-6 whitespace-pre-line text-ink/90">{listing.description}</p>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">Location</h2>
      <div className="mt-2">
        <MapView latitude={listing.latitude} longitude={listing.longitude} label={listing.title} />
      </div>

      <h2 className="mt-8 font-display text-lg font-semibold text-ink">
        Landlord: {listing.landlord.name} {listing.landlord.verified && "· Verified ✓"}
      </h2>
      <p className="mt-1 text-sm text-mute">
        Sign in as a tenant to message this landlord about viewing, price, or booking.
      </p>
      {/* Once signed in, this becomes: create a Conversation via POST /api/conversations,
          then render <ChatPanel conversationId={...} /> here. */}
    </div>
  );
}