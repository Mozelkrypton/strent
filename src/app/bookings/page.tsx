"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

type BookingRow = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  amount: number;
  moveInDate: string | null;
  createdAt: string;
  listing: { id: string; title: string; coverImageUrl: string | null };
};

const STATUS_TONE: Record<BookingRow["status"], string> = {
  PENDING: "bg-mute/10 text-ink",
  CONFIRMED: "bg-primary-light text-primary-dark",
  CANCELLED: "bg-danger/10 text-danger",
  COMPLETED: "bg-primary-light text-primary-dark"
};

export default function BookingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/bookings").then(async (res) => {
      if (res.status === 401) return router.push("/login");
      setRows(await res.json());
    });
  }

  useEffect(load, [router]);

  async function cancel(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" })
      });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) return <div className="mx-auto max-w-3xl px-4 py-10 text-sm text-mute">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Your booking requests</h1>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">No requests yet</p>
          <p className="mt-1 text-mute">
            <Link href="/" className="text-primary hover:underline">Browse houses</Link> and request to book one.
          </p>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
              <Link href={`/listings/${row.listing.id}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-mute/10">
                {row.listing.coverImageUrl && (
                  <Image src={row.listing.coverImageUrl} alt={row.listing.title} fill sizes="64px" className="object-cover" />
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <Link href={`/listings/${row.listing.id}`} className="truncate text-sm font-semibold text-ink hover:text-primary">
                  {row.listing.title}
                </Link>
                <p className="text-xs text-mute">
                  KES {row.amount.toLocaleString()}/mo
                  {row.moveInDate && ` · Move in ${new Date(row.moveInDate).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[row.status]}`}>
                {row.status}
              </span>
              {row.status === "PENDING" && (
                <button
                  onClick={() => cancel(row.id)}
                  disabled={busyId === row.id}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
