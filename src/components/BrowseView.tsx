"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import type { ListingSummary } from "@/types";

export default function BrowseView({ listings }: { listings: ListingSummary[] }) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div>
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView("grid")}
          className={`border-2 border-ink px-3 py-1 text-sm font-medium ${
            view === "grid" ? "bg-clay text-paper" : "bg-white text-ink"
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setView("map")}
          className={`border-2 border-ink px-3 py-1 text-sm font-medium ${
            view === "map" ? "bg-clay text-paper" : "bg-white text-ink"
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
