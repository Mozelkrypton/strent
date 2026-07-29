"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailBody />
    </Suspense>
  );
}

function VerifyEmailBody() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"pending" | "ok" | "error">("pending");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setError("Missing verification link.");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
      .then(async (res) => {
        if (res.ok) {
          setStatus("ok");
        } else {
          const data = await res.json();
          setStatus("error");
          setError(data.error ?? "Something went wrong");
        }
      })
      .catch(() => {
        setStatus("error");
        setError("Network error — please try again");
      });
  }, [token]);

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-xl font-bold text-ink">Email verification</h1>
      <div className="mt-6 text-sm">
        {status === "pending" && <p className="text-mute">Verifying…</p>}
        {status === "ok" && <p className="text-ink">Your email is verified.</p>}
        {status === "error" && <p className="text-danger font-medium">{error}</p>}
      </div>
      <div className="mt-4 text-sm text-mute">
        <Link href="/" className="hover:text-clay">
          Back to Strent
        </Link>
      </div>
    </div>
  );
}
