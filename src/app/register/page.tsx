"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "TENANT" });
  const [error, setError] = useState("");

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "Something went wrong");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-xl font-semibold">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update("role", "TENANT")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm ${form.role === "TENANT" ? "border-brand-500 bg-brand-50 text-brand-600" : "border-neutral-300"}`}
          >
            I&apos;m looking for a house
          </button>
          <button
            type="button"
            onClick={() => update("role", "LANDLORD")}
            className={`flex-1 rounded-md border px-3 py-2 text-sm ${form.role === "LANDLORD" ? "border-brand-500 bg-brand-50 text-brand-600" : "border-neutral-300"}`}
          >
            I have a house to list
          </button>
        </div>
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          placeholder="Phone (for M-Pesa/contact)"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white">
          Create account
        </button>
      </form>
    </div>
  );
}
