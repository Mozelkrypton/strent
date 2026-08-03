"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

type SavedRow = {
  savedId: string;
  listingId: string;
  title: string;
  price: number;
  unitTypeLabel: string;
  address: string;
  status: string;
  coverImageUrl: string | null;
};

export default function CartPage() {
  const router = useRouter();
  const [rows, setRows] = useState<SavedRow[] | null>(null);
  const [notTenant, setNotTenant] = useState(false);

  useEffect(() => {
    fetch("/api/saved").then(async (res) => {
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (res.status === 403) {
        setNotTenant(true);
        setRows([]);
        return;
      }
      setRows(await res.json());
    });
  }, [router]);

  async function remove(listingId: string) {
    setRows((prev) => prev?.filter((r) => r.listingId !== listingId) ?? null);
    await fetch(`/api/saved/${listingId}`, { method: "DELETE" });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Saved houses</h1>
      <p className="mt-1 text-sm text-mute">Your shortlist — houses you&apos;re considering, in one place.</p>

      {notTenant && (
        <p className="mt-8 text-sm text-mute">Saved houses are for tenant accounts.</p>
      )}

      {!notTenant && rows === null && <p className="mt-8 text-sm text-mute">Loading…</p>}

      {!notTenant && rows !== null && rows.length === 0 && (
        <div className="mt-8 rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">Nothing saved yet</p>
          <p className="mt-1 text-mute">
            Tap Save on any listing to add it here.{" "}
            <Link href="/" className="text-primary hover:underline">Browse houses</Link>
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-8 space-y-3">
          {rows.map((row) => (
            <div key={row.savedId} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
              <Link href={`/listings/${row.listingId}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-mute/10">
                {row.coverImageUrl && (
                  <Image src={row.coverImageUrl} alt={row.title} fill sizes="80px" className="object-cover" />
                )}
              </Link>
              <Link href={`/listings/${row.listingId}`} className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-ink">{row.title}</p>
                <p className="text-xs text-mute">{row.unitTypeLabel} · {row.address}</p>
                <p className="mt-1 font-mono text-sm font-bold text-ink">KES {row.price.toLocaleString()}</p>
              </Link>
              <button
                onClick={() => remove(row.listingId)}
                className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
