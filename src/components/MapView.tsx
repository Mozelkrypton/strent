type MapViewProps = {
  latitude: number;
  longitude: number;
  label?: string;
};

// MVP: uses the Google Maps Embed API (just needs a key with that API enabled,
// no client-side JS SDK required). Good enough for "show this one listing on a map."
// A multi-pin map for the browse page can move to @react-google-maps/api later.
export default function MapView({ latitude, longitude, label }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const query = encodeURIComponent(label ? `${label}@${latitude},${longitude}` : `${latitude},${longitude}`);
  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=15`
    : undefined;

  if (!src) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-lg bg-mute/10 text-sm text-mute">
        Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to show the map
      </div>
    );
  }

  return (
    <iframe
      title="Listing location"
      src={src}
      className="h-64 w-full border-2 border-ink"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}