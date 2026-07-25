"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";

type LocationPickerProps = {
  onChange: (loc: { latitude: number; longitude: number; address: string }) => void;
};

const NAIROBI = { lat: -1.2921, lng: 36.8219 };

export default function LocationPicker({ onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pickedAddress, setPickedAddress] = useState("");

  useEffect(() => {
    let marker: google.maps.Marker | null = null;

    loadGoogleMaps()
      .then((g) => {
        if (!mapRef.current) return;

        const map = new g.maps.Map(mapRef.current, {
          center: NAIROBI,
          zoom: 12,
          streetViewControl: false,
          mapTypeControl: false
        });

        function placeMarker(position: google.maps.LatLng, address?: string) {
          if (marker) marker.setMap(null);
          marker = new g.maps.Marker({ position, map });
          const latitude = position.lat();
          const longitude = position.lng();

          if (address) {
            setPickedAddress(address);
            onChange({ latitude, longitude, address });
          } else {
            new g.maps.Geocoder().geocode({ location: position }, (results, geoStatus) => {
              const resolvedAddress = geoStatus === "OK" && results?.[0] ? results[0].formatted_address : "";
              setPickedAddress(resolvedAddress);
              onChange({ latitude, longitude, address: resolvedAddress });
            });
          }
        }

        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) placeMarker(e.latLng);
        });

        if (searchRef.current) {
          const autocomplete = new g.maps.places.Autocomplete(searchRef.current, {
            componentRestrictions: { country: "ke" },
            fields: ["geometry", "formatted_address"]
          });
          autocomplete.bindTo("bounds", map);
          autocomplete.addListener("place_changed", () => {
            const place = autocomplete.getPlace();
            if (!place.geometry?.location) return;
            map.panTo(place.geometry.location);
            map.setZoom(16);
            placeMarker(place.geometry.location, place.formatted_address);
          });
        }

        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, [onChange]);

  if (status === "error") {
    return (
      <div className="border-2 border-ink bg-mute/10 p-4 text-sm text-mute">
        Map picker needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY set (with the Maps JavaScript + Places
        APIs enabled) to work.
      </div>
    );
  }

  return (
    <div>
      <input
        ref={searchRef}
        type="text"
        placeholder="Search an address or estate (e.g. Ruaka, Nairobi)"
        className="mb-2 w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
      />
      <div ref={mapRef} className="h-72 w-full border-2 border-ink bg-mute/10" />
      <p className="mt-2 text-xs text-mute">
        Search above, or click anywhere on the map to drop the pin exactly on the building.
        {pickedAddress && <span className="block font-medium text-ink">Selected: {pickedAddress}</span>}
      </p>
    </div>
  );
}
