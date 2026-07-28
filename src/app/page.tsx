import ListingCard from "@/components/ListingCard";
import Stamp from "@/components/Stamp";
import type { ListingSummary } from "@/types";

async function getListings(): Promise<ListingSummary[]> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/listings`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function HomePage() {
  const listings = await getListings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-10 flex items-start gap-4">
        <Stamp className="mt-2 shrink-0 text-sm" />
        <div>
          <h1 className="font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            Every house here has an owner behind it,
            <br className="hidden sm:block" /> not an agent&apos;s markup.
          </h1>
          <p className="mt-2 text-mute">
            Real photos, real locations on the map, and a direct line to message the landlord.
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <p className="border-2 border-dashed border-mute/60 p-8 text-center font-display text-lg text-mute">
          No houses posted yet — the first landlord to list one gets the wall to themselves.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
