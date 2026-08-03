"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type AdminListingRow = {
  id: string;
  title: string;
  price: number;
  status: string;
  address: string;
  coverImageUrl: string | null;
  landlord: { id: string; name: string; email: string };
  createdAt: string;
};

export default function AdminListingsPage() {
  const [rows, setRows] = useState<AdminListingRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/listings")
      .then((res) => res.json())
      .then(setRows);
  }

  useEffect(load, []);

  async function remove(id: string) {
    if (!confirm("Remove this listing? This can't be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/listings/${id}`, { method: "DELETE" });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) return <p className="text-sm text-mute">Loading…</p>;

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-sm">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-mute/10">
            {r.coverImageUrl && <Image src={r.coverImageUrl} alt={r.title} fill sizes="56px" className="object-cover" />}
          </div>
          <div className="min-w-0 flex-1">
            <Link href={`/listings/${r.id}`} className="truncate text-sm font-semibold text-ink hover:text-primary">
              {r.title}
            </Link>
            <p className="truncate text-xs text-mute">
              {r.address} · {r.landlord.name} ({r.landlord.email})
            </p>
            <p className="mt-0.5 font-mono text-xs font-bold text-ink">
              KES {r.price.toLocaleString()} · {r.status}
            </p>
          </div>
          <button
            onClick={() => remove(r.id)}
            disabled={busyId === r.id}
            className="shrink-0 rounded-full border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}
