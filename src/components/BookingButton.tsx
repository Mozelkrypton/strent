"use client";

import { useEffect, useState } from "react";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";

const STATUS_COPY: Record<BookingStatus, string> = {
  PENDING: "Your request is waiting on the landlord",
  CONFIRMED: "Confirmed — the landlord accepted your request",
  CANCELLED: "This request was cancelled",
  COMPLETED: "Booking complete"
};

export default function BookingButton({ listingId, price }: { listingId: string; price: number }) {
  const [visibility, setVisibility] = useState<"loading" | "hidden" | "form" | "status">("loading");
  const [status, setStatus] = useState<BookingStatus | null>(null);
  const [moveInDate, setMoveInDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then(async (profile) => {
        if (!profile || profile.role !== "TENANT") return setVisibility("hidden");

        const res = await fetch("/api/bookings");
        const bookings = res.ok ? await res.json() : [];
        const existing = bookings.find(
          (b: { listing: { id: string }; status: BookingStatus }) =>
            b.listing.id === listingId && b.status !== "CANCELLED"
        );
        if (existing) {
          setStatus(existing.status);
          setVisibility("status");
        } else {
          setVisibility("form");
        }
      });
  }, [listingId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const res = await fetch(`/api/listings/${listingId}/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moveInDate: moveInDate || undefined })
      });
      if (res.ok) {
        setStatus("PENDING");
        setVisibility("status");
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  }

  if (visibility === "loading" || visibility === "hidden") return null;

  if (visibility === "status" && status) {
    return (
      <div className="rounded-2xl bg-primary-light p-4 text-sm text-primary-dark">
        <p className="font-semibold">{STATUS_COPY[status]}</p>
        {status === "CONFIRMED" && (
          <p className="mt-1 text-primary-dark/80">Payment collection isn&apos;t wired up yet — the landlord will confirm once paid.</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl bg-surface p-4 shadow-card">
      <p className="text-sm font-semibold text-ink">Request to book</p>
      <p className="mt-1 text-xs text-mute">Agreed rent: KES {price.toLocaleString()}/month</p>
      <TextField
        type="date"
        className="mt-3"
        value={moveInDate}
        onChange={(e) => setMoveInDate(e.target.value)}
        placeholder="Preferred move-in date (optional)"
      />
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
      <Button disabled={busy} className="mt-3">
        {busy ? "Sending…" : "Request to book"}
      </Button>
    </form>
  );
}
