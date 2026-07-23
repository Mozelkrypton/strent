"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewListingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    bedrooms: "1",
    bathrooms: "1",
    address: "",
    latitude: "",
    longitude: ""
  });
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        bedrooms: Number(form.bedrooms),
        bathrooms: Number(form.bathrooms),
        latitude: Number(form.latitude),
        longitude: Number(form.longitude)
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
      <h1 className="text-xl font-semibold">List a house</h1>
      <p className="mt-1 text-sm text-neutral-500">
        You must be signed in as a landlord. Photo upload wires up to Cloudinary — add that
        piece next; for now paste image URLs directly in the API request.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <input
          required
          placeholder="Title (e.g. 2BR apartment in Ruaka)"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <textarea
          required
          placeholder="Description"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          rows={4}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            required
            type="number"
            placeholder="Rent (KES)"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Bedrooms"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            placeholder="Bathrooms"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <input
          required
          placeholder="Address"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            required
            placeholder="Latitude"
            value={form.latitude}
            onChange={(e) => update("latitude", e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            required
            placeholder="Longitude"
            value={form.longitude}
            onChange={(e) => update("longitude", e.target.value)}
            className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Publish listing
        </button>
      </form>
    </div>
  );
}
