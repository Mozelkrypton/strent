"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TextField from "@/components/TextField";
import Button from "@/components/Button";
import ImageUploader from "@/components/ImageUploader";

type Profile = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  avatarUrl: string | null;
  role: "TENANT" | "LANDLORD" | "ADMIN";
  verified: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
};

const ROLE_LABEL: Record<Profile["role"], string> = {
  TENANT: "Tenant",
  LANDLORD: "Landlord",
  ADMIN: "Admin"
};

export default function EditProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (res.status === 401) {
          router.push("/login");
          return null;
        }
        if (!res.ok) throw new Error("failed");
        return res.json();
      })
      .then((data) => data && setProfile(data))
      .catch(() => setLoadError(true));
  }, [router]);

  if (loadError) return <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-clay">Couldn&apos;t load your profile.</div>;
  if (!profile) return <div className="mx-auto max-w-2xl px-4 py-16 text-sm text-mute">Loading…</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 space-y-12">
      <header>
        <h1 className="font-display text-2xl font-bold text-ink">Your profile</h1>
        <p className="mt-1 text-sm text-mute">
          {ROLE_LABEL[profile.role]}
          {profile.role === "LANDLORD" && (profile.verified ? " · Verified" : " · Not yet verified")}
        </p>
      </header>

      <BasicInfoSection profile={profile} onUpdate={setProfile} />
      <PasswordSection />
      <TwoFactorSection enabled={profile.twoFactorEnabled} onChange={(v) => setProfile({ ...profile, twoFactorEnabled: v })} />
      <SessionsSection />
      <DangerZoneSection />
    </div>
  );
}

function BasicInfoSection({ profile, onUpdate }: { profile: Profile; onUpdate: (p: Profile) => void }) {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [resendStatus, setResendStatus] = useState("");

  async function resendVerification() {
    setResendStatus("Sending…");
    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    setResendStatus(res.ok ? "Verification link sent." : "Couldn't send it — try again shortly.");
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, bio, avatarUrl })
      });
      if (res.ok) {
        onUpdate({ ...profile, name, phone, bio, avatarUrl });
        setMessage("Saved.");
      } else {
        const data = await res.json();
        setMessage(data.error ?? "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">Basic info</h2>
      <form onSubmit={save} className="mt-4 space-y-4">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={56} height={56} className="h-14 w-14 border-2 border-ink object-cover" />
          ) : (
            <div className="h-14 w-14 border-2 border-ink bg-mustard/20" />
          )}
          <div className="flex-1">
            <ImageUploader onUploaded={(urls) => setAvatarUrl(urls[0])} />
          </div>
        </div>
        <TextField placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
        <TextField placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextField placeholder="Short bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <TextField value={profile.email} disabled className="opacity-60" />
        <p className="text-xs text-mute">
          Email {profile.emailVerified ? "verified" : "not verified"}
          {!profile.emailVerified && (
            <>
              {" — "}
              <button type="button" onClick={resendVerification} className="text-clay hover:underline">
                resend verification link
              </button>
            </>
          )}
        </p>
        {resendStatus && <p className="text-xs text-mute">{resendStatus}</p>}
        {message && <p className="text-sm text-ink">{message}</p>}
        <Button disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
      </form>
    </section>
  );
}

function PasswordSection() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated. Other devices have been signed out.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setMessage(data.error ?? "Something went wrong");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">Change password</h2>
      <form onSubmit={save} className="mt-4 space-y-4">
        <TextField
          type="password"
          placeholder="Current password"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          type="password"
          placeholder="New password"
          autoComplete="new-password"
          minLength={8}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        {message && <p className="text-sm text-ink">{message}</p>}
        <Button disabled={saving}>{saving ? "Saving…" : "Update password"}</Button>
      </form>
    </section>
  );
}

function TwoFactorSection({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  const [step, setStep] = useState<"idle" | "scanning" | "backup-codes">("idle");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [disablePassword, setDisablePassword] = useState("");
  const [error, setError] = useState("");

  async function startSetup() {
    setError("");
    const res = await fetch("/api/auth/2fa/setup");
    if (!res.ok) {
      setError("Couldn't start 2FA setup");
      return;
    }
    const data = await res.json();
    setSecret(data.secret);
    setQrDataUrl(data.qrDataUrl);
    setStep("scanning");
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/2fa/setup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret, code })
    });
    const data = await res.json();
    if (res.ok) {
      setBackupCodes(data.backupCodes);
      setStep("backup-codes");
      onChange(true);
    } else {
      setError(data.error ?? "Something went wrong");
    }
  }

  async function disable(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/2fa/disable", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: disablePassword })
    });
    const data = await res.json();
    if (res.ok) {
      onChange(false);
      setDisablePassword("");
      setStep("idle");
    } else {
      setError(data.error ?? "Something went wrong");
    }
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">Two-factor authentication</h2>

      {enabled && step === "idle" && (
        <form onSubmit={disable} className="mt-4 space-y-4">
          <p className="text-sm text-mute">2FA is on. Enter your password to turn it off.</p>
          <TextField
            type="password"
            placeholder="Current password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
            required
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <Button>Disable 2FA</Button>
        </form>
      )}

      {!enabled && step === "idle" && (
        <div className="mt-4">
          <p className="text-sm text-mute">Add a second step at sign-in using an authenticator app.</p>
          <Button className="mt-3" onClick={startSetup} type="button">
            Set up 2FA
          </Button>
          {error && <p className="mt-2 text-sm text-clay">{error}</p>}
        </div>
      )}

      {step === "scanning" && (
        <form onSubmit={confirmSetup} className="mt-4 space-y-4">
          <p className="text-sm text-mute">Scan this with Google Authenticator, Authy, or similar, then enter the code it shows.</p>
          {qrDataUrl && (
            <Image src={qrDataUrl} alt="2FA QR code" width={180} height={180} unoptimized className="border-2 border-ink" />
          )}
          <TextField
            required
            inputMode="numeric"
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <Button>Confirm & enable</Button>
        </form>
      )}

      {step === "backup-codes" && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-ink">
            2FA is on. Save these backup codes somewhere safe — each works once if you lose access to your authenticator app.
          </p>
          <ul className="grid grid-cols-2 gap-2 border-2 border-ink bg-mustard/10 p-3 font-mono text-sm">
            {backupCodes.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          <Button type="button" onClick={() => setStep("idle")}>
            Done
          </Button>
        </div>
      )}
    </section>
  );
}

type SessionRow = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
};

function SessionsSection() {
  const [sessions, setSessions] = useState<SessionRow[] | null>(null);

  function load() {
    fetch("/api/sessions")
      .then((res) => res.json())
      .then(setSessions);
  }

  useEffect(() => {
    load();
  }, []);

  async function revoke(id: string) {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <section>
      <h2 className="font-display text-lg font-bold text-ink">Signed-in devices</h2>
      <div className="mt-4 space-y-2">
        {!sessions && <p className="text-sm text-mute">Loading…</p>}
        {sessions?.length === 0 && <p className="text-sm text-mute">No active sessions.</p>}
        {sessions?.map((s) => (
          <div key={s.id} className="flex items-center justify-between border-2 border-ink px-3 py-2 text-sm">
            <div>
              <p className="text-ink">{s.userAgent ?? "Unknown device"}</p>
              <p className="text-xs text-mute">
                {s.ipAddress ?? "unknown IP"} · last used {new Date(s.lastUsedAt).toLocaleString()}
              </p>
            </div>
            <button onClick={() => revoke(s.id)} className="text-xs font-medium text-clay hover:underline">
              Sign out
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

function DangerZoneSection() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="border-2 border-clay p-4">
      <h2 className="font-display text-lg font-bold text-clay">Delete account</h2>
      <p className="mt-1 text-sm text-mute">
        This permanently removes your account, listings, conversations, and bookings. This can&apos;t be undone.
      </p>

      {!confirming ? (
        <Button
          type="button"
          className="mt-3 bg-paper text-clay"
          onClick={() => setConfirming(true)}
        >
          Delete my account
        </Button>
      ) : (
        <form onSubmit={deleteAccount} className="mt-4 space-y-3">
          <TextField
            type="password"
            required
            placeholder="Enter your password to confirm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-sm text-clay">{error}</p>}
          <div className="flex gap-2">
            <Button disabled={busy} className="bg-clay">
              {busy ? "Deleting…" : "Permanently delete"}
            </Button>
            <button type="button" onClick={() => setConfirming(false)} className="text-sm text-mute hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
