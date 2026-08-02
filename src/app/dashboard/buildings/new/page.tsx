"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import LocationPicker from "@/components/LocationPicker";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function NewBuildingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState<{ latitude: number | null; longitude: number | null; address: string } | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleLocationChange = useCallback(
    (loc: { latitude: number | null; longitude: number | null; address: string }) => setLocation(loc),
    []
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!location || !location.address.trim()) {
      setError("Enter an address for the building.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/buildings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          address: location.address,
          latitude: location.latitude,
          longitude: location.longitude
        })
      });
      if (res.ok) {
        const building = await res.json();
        router.push(`/dashboard/buildings/${building.id}`);
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
      <h1 className="font-display text-xl font-bold text-ink">Add a building</h1>
      <p className="mt-1 text-sm text-mute">
        One address and map pin, shared by every unit you add inside it afterward.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          required
          placeholder="Building name (e.g. Kileleshwa Court)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          placeholder="Anything tenants should know about the building itself (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-ink/10 bg-surface px-4 py-3 text-sm font-body shadow-sm transition-all duration-150 ease-smooth placeholder:text-mute/70 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-ink">Building location</label>
          <LocationPicker onChange={handleLocationChange} />
        </div>
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        <Button disabled={saving} className="w-full">
          {saving ? "Saving…" : "Create building"}
        </Button>
      </form>
    </div>
  );
}
