"use client";

import { useEffect, useState } from "react";

type LogRow = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  detail: string | null;
  createdAt: string;
  admin: { name: string; email: string };
};

export default function AdminAuditLogPage() {
  const [rows, setRows] = useState<LogRow[] | null>(null);

  useEffect(() => {
    fetch("/api/admin/audit-log")
      .then((res) => res.json())
      .then(setRows);
  }, []);

  if (!rows) return <p className="text-sm text-mute">Loading…</p>;
  if (rows.length === 0) return <p className="text-sm text-mute">No admin actions recorded yet.</p>;

  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-surface px-4 py-2.5 text-sm shadow-sm">
          <div>
            <span className="font-mono font-semibold text-ink">{r.action}</span>
            <span className="text-mute"> · {r.targetType} {r.targetId.slice(0, 8)}</span>
            {r.detail && <span className="text-mute"> — {r.detail}</span>}
          </div>
          <div className="text-xs text-mute">
            {r.admin.name} · {new Date(r.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
