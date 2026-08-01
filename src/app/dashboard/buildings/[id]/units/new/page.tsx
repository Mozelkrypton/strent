"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/ImageUploader";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import { UNIT_TYPES, type UnitTypeKey } from "@/lib/units";

export default function NewUnitPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", description: "", price: "", bathrooms: "1" });
  const [unitType, setUnitType] = useState<UnitTypeKey>("ONE_BEDROOM");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (imageUrls.length === 0) {
      setError("Add at least one photo — units without photos get far less interest.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/buildings/${params.id}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          bathrooms: Number(form.bathrooms),
          unitType,
          imageUrls
        })
      });
      if (res.ok) {
        router.push(`/dashboard/buildings/${params.id}`);
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-display text-xl font-bold text-ink">Add a unit</h1>
      <p className="mt-1 text-sm text-mute">Location is inherited from the building — just the unit details here.</p>
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
          placeholder="Unit title (e.g. Unit 4B)"
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
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        <Button disabled={saving} className="w-full">
          {saving ? "Saving…" : "Publish unit"}
        </Button>
      </form>
    </div>
  );
}
