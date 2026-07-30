"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import type { ListingSummary } from "@/types";
import { SORT_OPTIONS, type SortKey } from "@/lib/reviews/categories";

export default function BrowseView({
  listings: initialListings,
  initialView = "grid"
}: {
  listings: ListingSummary[];
  initialView?: "grid" | "map";
}) {
  const [view, setView] = useState<"grid" | "map">(initialView);
  const [listings, setListings] = useState(initialListings);
  const [sortBy, setSortBy] = useState<SortKey>("overall");
  const [loading, setLoading] = useState(false);

  async function handleSortChange(next: SortKey) {
    setSortBy(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/listings?sortBy=${next}`);
      if (res.ok) setListings(await res.json());
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex gap-1 rounded-xl border border-ink/10 bg-white p-1 shadow-sm">
          <button
            onClick={() => setView("grid")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-smooth ${
              view === "grid" ? "bg-clay text-paper shadow-sm" : "text-ink hover:bg-mute/10"
            }`}
          >
            Grid
          </button>
          <button
            onClick={() => setView("map")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-smooth ${
              view === "map" ? "bg-clay text-paper shadow-sm" : "text-ink hover:bg-mute/10"
            }`}
          >
            Map
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm text-mute">
          Sort by what matters to you
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value as SortKey)}
            disabled={loading}
            className="rounded-lg border border-ink/10 bg-white px-2.5 py-1.5 text-sm font-medium text-ink shadow-sm transition-all duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {view === "grid" ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <ListingsMap listings={listings} />
      )}
    </div>
  );
}
