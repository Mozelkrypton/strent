"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type MoreMenuProps = {
  signedIn: boolean;
  firstName?: string;
};

export default function MoreMenu({ signedIn, firstName }: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="More options"
        aria-expanded={open}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/10 bg-surface text-ink shadow-sm transition-all duration-200 ease-smooth hover:bg-mute/5"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
          <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-64 rounded-2xl border border-ink/5 bg-surface p-2 shadow-card-hover">
          {/* House-hunting links — repeated here so nothing is out of reach on small screens */}
          <div className="border-b border-ink/5 pb-2">
            <MenuLink href="/" label="Browse listings" onNavigate={() => setOpen(false)} />
            <MenuLink href="/?view=map" label="Search by map" onNavigate={() => setOpen(false)} />
            <MenuLink href="/dashboard" label="List a house" onNavigate={() => setOpen(false)} />
            <MenuLink href="/how-it-works" label="How it works" onNavigate={() => setOpen(false)} />
            <MenuLink href="/help" label="Help & safety" onNavigate={() => setOpen(false)} />
          </div>

          {/* Account */}
          <div className="pt-2">
            {signedIn ? (
              <>
                <MenuLink href="/profile/edit" label={firstName ? `${firstName}'s profile` : "Your profile"} onNavigate={() => setOpen(false)} />
                <button
                  onClick={handleSignOut}
                  className="block w-full rounded-lg px-3 py-2 text-left text-sm text-ink transition-colors hover:bg-mute/5"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <MenuLink href="/login" label="Sign in" onNavigate={() => setOpen(false)} />
                <MenuLink href="/register" label="Create an account" onNavigate={() => setOpen(false)} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, label, onNavigate }: { href: string; label: string; onNavigate: () => void }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="block rounded-lg px-3 py-2 text-sm text-ink transition-colors hover:bg-mute/5"
    >
      {label}
    </Link>
  );
}
