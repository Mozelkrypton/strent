"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        if (data.twoFactorRequired) {
          router.push(`/login/2fa?challenge=${encodeURIComponent(data.challengeToken)}`);
          return;
        }
        router.push("/");
        router.refresh();
      } else {
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
      <h1 className="font-display text-xl font-bold text-ink">Sign in</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <TextField
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <TextField
          type="password"
          required
          autoComplete="current-password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        {error && <p className="text-sm text-danger font-medium">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="mt-4 flex justify-between text-sm text-mute">
        <Link href="/forgot-password" className="hover:text-clay">
          Forgot password?
        </Link>
        <Link href="/register" className="hover:text-clay">
          Create an account
        </Link>
      </div>
    </div>
  );
}
