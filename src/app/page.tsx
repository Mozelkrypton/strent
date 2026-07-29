import BrowseView from "@/components/BrowseView";
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
    <div>
      <div className="relative overflow-hidden border-b border-ink/5 bg-gradient-to-b from-primary-light/40 to-canvas">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <Stamp className="text-sm" />
          <h1 className="mt-6 max-w-2xl font-display text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl">
            Every house here has an owner behind it,
            <span className="text-primary"> not an agent&apos;s markup.</span>
          </h1>
          <p className="mt-4 max-w-lg text-lg text-mute">
            Real photos, real locations on the map, and a direct line to message the landlord.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10">
        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
            <p className="font-display text-lg font-semibold text-ink">No houses posted yet</p>
            <p className="mt-1 text-mute">The first landlord to list one gets the wall to themselves.</p>
          </div>
        ) : (
          <BrowseView listings={listings} />
        )}
      </div>
    </div>
  );
}
