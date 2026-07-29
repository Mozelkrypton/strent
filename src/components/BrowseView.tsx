"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import type { ListingSummary } from "@/types";

export default function BrowseView({ listings }: { listings: ListingSummary[] }) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div>
      <div className="mb-4 inline-flex gap-1 rounded-xl border border-ink/10 bg-white p-1 shadow-sm">
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
