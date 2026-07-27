"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function TwoFactorChallengePage() {
  return (
    <Suspense fallback={null}>
      <TwoFactorChallengeForm />
    </Suspense>
  );
}

function TwoFactorChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeToken = searchParams.get("challenge") ?? "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code })
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-xl font-bold text-ink">Two-factor verification</h1>
      <p className="mt-2 text-sm text-mute">
        Enter the 6-digit code from your authenticator app, or one of your backup codes.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          required
          autoFocus
          inputMode="numeric"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        {error && <p className="text-sm text-clay font-medium">{error}</p>}
        <Button disabled={loading || !challengeToken} className="w-full">
          {loading ? "Verifying…" : "Verify"}
        </Button>
      </form>
    </div>
  );
}
