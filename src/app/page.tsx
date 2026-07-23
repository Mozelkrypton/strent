import ListingCard from "@/components/ListingCard";
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
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Find a house, talk to the landlord directly</h1>
        <p className="mt-1 text-neutral-500">No agent fees. See real photos, real locations, and message the owner.</p>
      </div>

      {listings.length === 0 ? (
        <p className="rounded-lg border border-dashed border-neutral-300 p-8 text-center text-neutral-500">
          No listings yet — landlords can add the first one from &ldquo;List a house&rdquo;.
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
