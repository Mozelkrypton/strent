"use client";

import { useEffect, useState } from "react";

export default function SaveButton({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState<"loading" | "signed-out" | "not-tenant" | "saved" | "unsaved">("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then(async (profile) => {
        if (!profile) return setStatus("signed-out");
        if (profile.role !== "TENANT") return setStatus("not-tenant");

        const savedRes = await fetch("/api/saved");
        const saved = savedRes.ok ? await savedRes.json() : [];
        const isSaved = saved.some((s: { listingId: string }) => s.listingId === listingId);
        setStatus(isSaved ? "saved" : "unsaved");
      });
  }, [listingId]);

  async function toggle() {
    if (status !== "saved" && status !== "unsaved") return;
    setBusy(true);
    try {
      if (status === "unsaved") {
        const res = await fetch("/api/saved", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId })
        });
        if (res.ok) setStatus("saved");
      } else {
        const res = await fetch(`/api/saved/${listingId}`, { method: "DELETE" });
        if (res.ok) setStatus("unsaved");
      }
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading") return null;
  if (status === "signed-out" || status === "not-tenant") return null;

  return (
    <button
      onClick={toggle}
      disabled={busy}
      aria-pressed={status === "saved"}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 ease-smooth disabled:opacity-60 ${
        status === "saved"
          ? "border-primary/20 bg-primary-light text-primary-dark"
          : "border-ink/10 bg-surface text-ink hover:bg-mute/5"
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-4 w-4"
        fill={status === "saved" ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M5 3.5A1.5 1.5 0 0 1 6.5 2h7A1.5 1.5 0 0 1 15 3.5v14l-5-3-5 3v-14z" strokeLinejoin="round" />
      </svg>
      {status === "saved" ? "Saved" : "Save"}
    </button>
  );
}
