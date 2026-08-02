"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import LocationPicker from "@/components/LocationPicker";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { UNIT_TYPES, type UnitTypeKey } from "@/lib/units";

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    bathrooms: "1"
  });
  const [unitType, setUnitType] = useState<UnitTypeKey>("ONE_BEDROOM");
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null; address: string } | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const handleLocationChange = useCallback(
    (loc: { latitude: number | null; longitude: number | null; address: string }) => setLocation(loc),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (imageUrls.length === 0) {
      setError("Add at least one photo — listings without photos get far less interest.");
      return;
    }
    if (!location || !location.address.trim()) {
      setError("Enter an address for the house.");
      return;
    }
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        bathrooms: Number(form.bathrooms),
        unitType,
        address: location.address,
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
      <h1 className="font-display text-xl font-bold text-ink">List a standalone house</h1>
      <p className="mt-1 text-sm text-mute">
        For a single house you rent out. Managing a building with several units?{" "}
        <a href="/dashboard" className="text-primary hover:underline">Go to your dashboard</a> instead.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Photos</label>
          <ImageUploader onUploaded={(urls) => setImageUrls((prev) => [...prev, ...urls])} />
          {imageUrls.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {imageUrls.map((url) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={url} src={url} alt="" className="h-16 w-full rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>
        <TextField
          required
          placeholder="Title (e.g. 2BR apartment in Ruaka)"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-body shadow-sm transition-all duration-150 ease-smooth placeholder:text-mute/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <div className="grid grid-cols-3 gap-2">
          <TextField
            required
            type="number"
            placeholder="Rent (KES)"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as UnitTypeKey)}
            className="w-full rounded-xl border border-ink/10 bg-surface px-3 py-3 text-sm font-body shadow-sm transition-all duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
          >
            {UNIT_TYPES.map((u) => (
              <option key={u.key} value={u.key}>
                {u.label}
              </option>
            ))}
          </select>
          <TextField
            type="number"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">House location</label>
          <LocationPicker onChange={handleLocationChange} />
        </div>
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        <Button className="w-full">Publish listing</Button>
      </form>
    </div>
  );
}
