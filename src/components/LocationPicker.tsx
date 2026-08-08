"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/loadGoogleMaps";
import TextField from "@/components/TextField";

type LocationValue = { latitude: number | null; longitude: number | null; address: string };

type LocationPickerProps = {
  onChange: (loc: LocationValue) => void;
};

const NAIROBI = { lat: -1.2921, lng: 36.8219 };

// The map pin is a nice-to-have, not a requirement — Google Maps needs a
// billed API key, which not every landlord will have set up. Typing a plain
// address always works; the map is just a faster way to get exact coordinates
// when it's available.
export default function LocationPicker({ onChange }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [mapStatus, setMapStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const [manualAddress, setManualAddress] = useState("");
  const [pickedAddress, setPickedAddress] = useState("");

  function handleManualAddressChange(value: string) {
    setManualAddress(value);
    // Typing manually clears any map pin — the two are mutually exclusive
    // sources for the same field, so don't send stale coordinates for a
    // now-different address.
    onChange({ latitude: null, longitude: null, address: value });
  }

  useEffect(() => {
    let marker: google.maps.Marker | null = null;
    let cancelled = false;

    loadGoogleMaps()
      .then((g) => {
        if (cancelled || !mapRef.current) return;

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
            setManualAddress(address);
            onChange({ latitude, longitude, address });
          } else {
            new g.maps.Geocoder().geocode({ location: position }, (results, geoStatus) => {
              const resolvedAddress = geoStatus === "OK" && results?.[0] ? results[0].formatted_address : "";
              setPickedAddress(resolvedAddress);
              setManualAddress(resolvedAddress);
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

        setMapStatus("ready");
      })
      .catch(() => setMapStatus("unavailable"));

    return () => {
      cancelled = true;
    };
  }, [onChange]);

  return (
    <div className="space-y-3">
      <TextField
        placeholder="Address (e.g. Ruaka, Nairobi)"
        value={manualAddress}
        onChange={(e) => handleManualAddressChange(e.target.value)}
      />

      {mapStatus === "unavailable" ? (
        <p className="text-xs text-mute">
          Map pin isn&apos;t set up for this deployment the address above is all that&apos;s needed. A map
          pin can be added later once Google Maps is configured.
        </p>
      ) : (
        <div>
          <input
            ref={searchRef}
            type="text"
            placeholder="Or search here to drop an exact pin (optional)"
            className="mb-2 w-full rounded-lg border border-ink/15 bg-white px-3 py-2 text-sm font-body shadow-sm transition-all duration-150 ease-smooth focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/40"
          />
          <div ref={mapRef} className="h-72 w-full overflow-hidden rounded-2xl border border-ink/10 bg-mute/10 shadow-soft" />
          <p className="mt-2 text-xs text-mute">
            {mapStatus === "loading"
              ? "Loading map…"
              : "Optional — search above or click the map to drop an exact pin."}
            {pickedAddress && <span className="block font-medium text-ink">Pin set: {pickedAddress}</span>}
          </p>
        </div>
      )}
    </div>
  );
}
