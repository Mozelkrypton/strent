let loadPromise: Promise<typeof google> | null = null;

// Loads the Maps JS API + Places library exactly once, however many components need it.
export function loadGoogleMaps(): Promise<typeof google> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("loadGoogleMaps can only run in the browser"));
  }
  if (window.google?.maps) return Promise.resolve(window.google);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      reject(new Error("NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set"));
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places&v=weekly`;
    script.async = true;
    script.onload = () => resolve(window.google);
    script.onerror = () => reject(new Error("Failed to load Google Maps script"));
    document.head.appendChild(script);
  });

  return loadPromise;
}

declare global {
  interface Window {
    google: typeof google;
  }
}
