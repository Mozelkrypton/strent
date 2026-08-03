"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  adminLevel: "ADMIN" | "SUPER_ADMIN" | null;
  verified: boolean;
  suspended: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function load() {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then(setUsers);
    fetch("/api/profile")
      .then((res) => res.json())
      .then((profile) => setIsSuperAdmin(profile.adminLevel === "SUPER_ADMIN"));
  }

  useEffect(load, []);

  async function act(userId: string, action: string) {
    setBusyId(userId);
    setError("");
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        load();
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setBusyId(null);
    }
  }

  if (!users) return <p className="text-sm text-mute">Loading…</p>;

  return (
    <div>
      {error && <p className="mb-4 text-sm text-danger">{error}</p>}
      <div className="space-y-2">
        {users.map((u) => (
          <div key={u.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface p-4 shadow-sm">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {u.name} <span className="font-normal text-mute">· {u.email}</span>
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs">
                <Badge>{u.role}{u.adminLevel ? ` · ${u.adminLevel}` : ""}</Badge>
                {u.verified && <Badge tone="primary">Verified</Badge>}
                {u.suspended && <Badge tone="danger">Suspended</Badge>}
                {u.twoFactorEnabled && <Badge>2FA on</Badge>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {u.suspended ? (
                <ActionButton onClick={() => act(u.id, "unsuspend")} busy={busyId === u.id}>
                  Unsuspend
                </ActionButton>
              ) : (
                <ActionButton onClick={() => act(u.id, "suspend")} busy={busyId === u.id} tone="danger">
                  Suspend
                </ActionButton>
              )}
              <ActionButton onClick={() => act(u.id, "revoke-sessions")} busy={busyId === u.id}>
                Sign out everywhere
              </ActionButton>
              {isSuperAdmin && u.role !== "ADMIN" && (
                <ActionButton onClick={() => act(u.id, "grant-admin")} busy={busyId === u.id}>
                  Make admin
                </ActionButton>
              )}
              {isSuperAdmin && u.adminLevel === "ADMIN" && (
                <ActionButton onClick={() => act(u.id, "grant-super-admin")} busy={busyId === u.id}>
                  Make super-admin
                </ActionButton>
              )}
              {isSuperAdmin && u.role === "ADMIN" && (
                <ActionButton onClick={() => act(u.id, "revoke-admin")} busy={busyId === u.id} tone="danger">
                  Revoke admin
                </ActionButton>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "primary" | "danger" }) {
  const toneClass =
    tone === "primary"
      ? "bg-primary-light text-primary-dark"
      : tone === "danger"
        ? "bg-danger/10 text-danger"
        : "bg-mute/10 text-ink";
  return <span className={`rounded-full px-2 py-0.5 font-medium ${toneClass}`}>{children}</span>;
}

function ActionButton({
  children,
  onClick,
  busy,
  tone = "neutral"
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy: boolean;
  tone?: "neutral" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm transition-colors disabled:opacity-50 ${
        tone === "danger"
          ? "border-danger/30 text-danger hover:bg-danger/5"
          : "border-ink/10 text-ink hover:bg-mute/5"
      }`}
    >
      {children}
    </button>
  );
}
