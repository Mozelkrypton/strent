"use client";

import { useState } from "react";
import ListingCard from "@/components/ListingCard";
import ListingsMap from "@/components/ListingsMap";
import type { ListingSummary } from "@/types";

export default function BrowseView({ listings }: { listings: ListingSummary[] }) {
  const [view, setView] = useState<"grid" | "map">("grid");

  return (
    <div>
<<<<<<< HEAD
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setView("grid")}
          className={`border-2 border-ink px-3 py-1 text-sm font-medium ${
            view === "grid" ? "bg-clay text-paper" : "bg-white text-ink"
=======
      <div className="mb-4 inline-flex gap-1 rounded-xl border border-ink/10 bg-white p-1 shadow-sm">
        <button
          onClick={() => setView("grid")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-smooth ${
            view === "grid" ? "bg-clay text-paper shadow-sm" : "text-ink hover:bg-mute/10"
>>>>>>> master
          }`}
        >
          Grid
        </button>
        <button
          onClick={() => setView("map")}
<<<<<<< HEAD
          className={`border-2 border-ink px-3 py-1 text-sm font-medium ${
            view === "map" ? "bg-clay text-paper" : "bg-white text-ink"
=======
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 ease-smooth ${
            view === "map" ? "bg-clay text-paper shadow-sm" : "text-ink hover:bg-mute/10"
>>>>>>> master
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
