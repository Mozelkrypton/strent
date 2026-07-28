"use client";

import { useState } from "react";
import Link from "next/link";
import TextField from "@/components/TextField";
import Button from "@/components/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      // The API always responds the same way regardless of whether the
      // email matched an account — don't let the UI leak that either.
      setMessage(data.message ?? "If an account exists for that email, a reset link has been sent.");
    } catch {
      setMessage("Network error — please try again");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-xl font-bold text-ink">Reset your password</h1>
      {message ? (
        <p className="mt-6 text-sm text-ink">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <TextField
            type="email"
            required
            autoComplete="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button disabled={loading} className="w-full">
            {loading ? "Sending…" : "Send reset link"}
          </Button>
        </form>
      )}
      <div className="mt-4 text-sm text-mute">
        <Link href="/login" className="hover:text-clay">
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
