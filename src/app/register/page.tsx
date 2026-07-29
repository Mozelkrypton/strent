"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
=======
import TextField from "@/components/TextField";
import Button from "@/components/Button";
>>>>>>> master

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "", role: "TENANT" });
  const [error, setError] = useState("");
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(false);
>>>>>>> master

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
<<<<<<< HEAD
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
=======
    setLoading(true);
    try {
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
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
>>>>>>> master
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-display text-xl font-bold text-ink">Create your account</h1>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
<<<<<<< HEAD
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => update("role", "TENANT")}
            className={`flex-1 border-2 px-3 py-2 text-sm ${form.role === "TENANT" ? "border-clay bg-mustard/30 text-ink" : "border-ink"}`}
=======
        <div className="flex gap-2 rounded-xl border border-ink/10 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => update("role", "TENANT")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-smooth ${
              form.role === "TENANT" ? "bg-mustard/30 text-ink shadow-sm" : "text-mute hover:bg-mute/10"
            }`}
>>>>>>> master
          >
            I&apos;m looking for a house
          </button>
          <button
            type="button"
            onClick={() => update("role", "LANDLORD")}
<<<<<<< HEAD
            className={`flex-1 border-2 px-3 py-2 text-sm ${form.role === "LANDLORD" ? "border-clay bg-mustard/30 text-ink" : "border-ink"}`}
=======
            className={`flex-1 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-smooth ${
              form.role === "LANDLORD" ? "bg-mustard/30 text-ink shadow-sm" : "text-mute hover:bg-mute/10"
            }`}
>>>>>>> master
          >
            I have a house to list
          </button>
        </div>
<<<<<<< HEAD
        <input
=======
        <TextField
>>>>>>> master
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
<<<<<<< HEAD
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <input
          placeholder="Phone (for M-Pesa/contact)"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          className="w-full border-2 border-ink bg-white px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-clay"
        />
        {error && <p className="text-sm text-clay font-medium">{error}</p>}
        <button className="w-full border-2 border-ink bg-clay px-4 py-2 text-sm font-medium text-paper shadow-[2px_2px_0_0_#211D16] transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none">
          Create account
        </button>
      </form>
    </div>
  );
}
=======
        />
        <TextField
          type="email"
          required
          autoComplete="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
        />
        <TextField
          placeholder="Phone (for M-Pesa/contact)"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
        />
        <TextField
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
        />
        {error && <p className="text-sm text-clay font-medium">{error}</p>}
        <Button disabled={loading} className="w-full">
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
>>>>>>> master
