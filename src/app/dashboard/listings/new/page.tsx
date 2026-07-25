"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import LocationPicker from "@/components/LocationPicker";

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    bedrooms: "1",
    bathrooms: "1"
  });
  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const handleLocationChange = useCallback(
    (loc: { latitude: number; longitude: number; address: string }) => setLocation(loc),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (imageUrls.length === 0) {
      setError("Add at least one photo — listings without photos get far less interest.");
      return;
    }
    if (!location) {
      setError("Search or click the map to set the building's location.");
      return;
    }
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        address: location.address || "Pinned location",
        latitude: location.latitude,
        longitude: location.longitude,
        imageUrls
      })
    });
    if (res.ok) {
      const listing = await res.json();
      router.push(`/listings/${listing.id}`);
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-xl font-bold text-ink">List a house</h1>
      <p className="mt-1 text-sm text-mute">You must be signed in as a landlord.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Photos</label>
          <ImageUploader onUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])} />
          {imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-16 w-full rounded object-cover" />
              ))}
            </div>
          )}
        </div>
        <input
          required
          placeholder="Title (e.g. 2BR apartment in Ruaka)"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            required
            type="number"
            placeholder="Rent (KES)"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
          />
          <input
            type="number"
            placeholder="Bedrooms"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            className="border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
          />
          <input
            type="number"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
            className="border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Building location</label>
          <LocationPicker onChange={handleLocationChange} />
        </div>
        {error && <p className="text-sm text-clay font-medium">{error}</p>}
        <button className="w-full border-2 border-ink bg-clay px-4 py-2 text-sm font-medium text-paper shadow-[2px_2px_0_0_#211D16] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
          Publish listing
        </button>
      </form>
    </div>
  );
}
