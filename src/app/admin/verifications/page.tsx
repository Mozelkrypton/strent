"use client";

import { useEffect, useState } from "react";

type VerificationRow = {
  id: string;
  idDocumentUrl: string;
  ownershipDocumentUrl: string;
  note: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string };
};

export default function AdminVerificationsPage() {
  const [rows, setRows] = useState<VerificationRow[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});

  function load() {
    fetch("/api/admin/verifications?status=PENDING")
      .then((res) => res.json())
      .then(setRows);
  }

  useEffect(load, []);

  async function decide(id: string, action: "approve" | "reject") {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/verifications/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason: reasonDraft[id] })
      });
      if (res.ok) load();
    } finally {
      setBusyId(null);
    }
  }

  if (!rows) return <p className="text-sm text-mute">Loading…</p>;
  if (rows.length === 0) {
    return <p className="text-sm text-mute">No pending verification requests.</p>;
  }

  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id} className="rounded-2xl bg-surface p-5 shadow-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-ink">
              {r.user.name} <span className="font-normal text-mute">· {r.user.email}</span>
            </p>
            <p className="text-xs text-mute">Submitted {new Date(r.createdAt).toLocaleDateString()}</p>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <a href={r.idDocumentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
              View ID document →
            </a>
            <a
              href={r.ownershipDocumentUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary hover:underline"
            >
              View ownership document →
            </a>
          </div>

          {r.note && <p className="mt-2 text-sm text-ink/70">&ldquo;{r.note}&rdquo;</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => decide(r.id, "approve")}
              disabled={busyId === r.id}
              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              Approve
            </button>
            <input
              placeholder="Reason if rejecting"
              value={reasonDraft[r.id] ?? ""}
              onChange={(e) => setReasonDraft((prev) => ({ ...prev, [r.id]: e.target.value }))}
              className="rounded-full border border-ink/10 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={() => decide(r.id, "reject")}
              disabled={busyId === r.id || !reasonDraft[r.id]}
              className="rounded-full border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/5 disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
