"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BookingRow = {
  id: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  amount: number;
  moveInDate: string | null;
  createdAt: string;
  listing: { id: string; title: string };
  tenant: { id: string; name: string; email: string; phone: string | null };
};

const STATUS_TONE: Record<BookingRow["status"], string> = {
  PENDING: "bg-mute/10 text-ink",
  CONFIRMED: "bg-primary-light text-primary-dark",
  CANCELLED: "bg-danger/10 text-danger",
  COMPLETED: "bg-primary-light text-primary-dark"
};

export default function LandlordBookingsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/bookings/landlord").then(async (res) => {
      if (res.status === 401) return router.push("/login");
      if (res.status === 403) return router.push("/dashboard");
      setRows(await res.json());
    });
  }

  useEffect(load, [router]);

  async function act(id: string, action: "confirm" | "cancel" | "mark-paid") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-mute">Loading…</div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/dashboard" className="text-sm text-mute hover:text-primary">
        ← Dashboard
      </Link>
      <h1 className="mt-2 font-display text-2xl font-bold text-ink">Booking requests</h1>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-mute">No booking requests yet.</p>
      ) : (
        <div className="mt-8 space-y-3">
          {rows.map((row) => (
            <div key={row.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={`/listings/${row.listing.id}`} className="text-sm font-semibold text-ink hover:text-primary">
                    {row.listing.title}
                  </Link>
                  <p className="text-xs text-mute">
                    {row.tenant.name} · {row.tenant.email}
                    {row.tenant.phone && ` · ${row.tenant.phone}`}
                  </p>
                  <p className="mt-1 text-xs text-mute">
                    KES {row.amount.toLocaleString()}/mo
                    {row.moveInDate && ` · Move in ${new Date(row.moveInDate).toLocaleDateString()}`}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_TONE[row.status]}`}>
                  {row.status}
                </span>
              </div>

              {row.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => act(row.id, "confirm")}
                    disabled={busyId === row.id}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => act(row.id, "cancel")}
                    disabled={busyId === row.id}
                    className="rounded-full border border-danger/30 px-4 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
                  >
                    Decline
                  </button>
                </div>
              )}
              {row.status === "CONFIRMED" && (
                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => act(row.id, "mark-paid")}
                    disabled={busyId === row.id}
                    className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
                  >
                    Mark as paid
                  </button>
                  <span className="text-xs text-mute">Manual for now — M-Pesa confirmation isn&apos;t wired up yet.</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
