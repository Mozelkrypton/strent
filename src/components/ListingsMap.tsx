"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";
import type { ListingSummary } from "@/types";

const NAIROBI = { lat: -1.2921, lng: 36.8219 };

export default function ListingsMap({ listings }: { listings: ListingSummary[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let markers: google.maps.Marker[] = [];

    loadGoogleMaps()
      .then((g) => {
        if (!mapRef.current) return;

        const map = new g.maps.Map(mapRef.current, {
          center: listings[0] ? { lat: listings[0].latitude, lng: listings[0].longitude } : NAIROBI,
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false
        });

        const infoWindow = new g.maps.InfoWindow();
        const bounds = new g.maps.LatLngBounds();

        markers = listings.map((listing) => {
          const position = { lat: listing.latitude, lng: listing.longitude };
          bounds.extend(position);
          const marker = new g.maps.Marker({ position, map, title: listing.title });
          marker.addListener("click", () => {
            infoWindow.setContent(
              `<div style="font-family: sans-serif; font-size: 13px;">
                 <strong>${listing.title}</strong><br/>
                 KES ${listing.price.toLocaleString()}/mo<br/>
                 <a href="/listings/${listing.id}" style="color:#B54A2C;">View listing →</a>
               </div>`
            );
            infoWindow.open(map, marker);
          });
          return marker;
        });

        if (listings.length > 1) map.fitBounds(bounds);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));

    return () => markers.forEach((m) => m.setMap(null));
  }, [listings]);

  if (status === "error") {
    return (
<<<<<<< HEAD
      <div className="flex h-96 items-center justify-center border-2 border-ink bg-mute/10 text-sm text-mute">
=======
      <div className="flex h-96 items-center justify-center rounded-2xl border border-ink/10 bg-mute/10 text-sm text-mute">
>>>>>>> master
        Map view needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set to work.
      </div>
    );
  }

<<<<<<< HEAD
  return <div ref={mapRef} className="h-96 w-full border-2 border-ink" />;
=======
  return <div ref={mapRef} className="h-96 w-full overflow-hidden rounded-2xl border border-ink/10 shadow-soft" />;
>>>>>>> master
}
