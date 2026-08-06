"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import ChatPanel from "@/components/ChatPanel";

type ConversationRow = {
  id: string;
  listing: { id: string; title: string; price: number };
  otherParty: string;
  lastMessage: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesInbox />
    </Suspense>
  );
}

function MessagesInbox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("c");

  const [rows, setRows] = useState<ConversationRow[] | null>(null);
  const [myUserId, setMyUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => setMyUserId(profile?.id));
  }, []);

  function load() {
    fetch("/api/conversations").then(async (res) => {
      if (res.status === 401) return router.push("/login");
      setRows(await res.json());
    });
  }

  useEffect(load, [router]);

  // Refresh the list periodically so unread counts / last-message previews
  // update while a conversation is open in the same tab.
  useEffect(() => {
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) return <div className="mx-auto max-w-4xl px-4 py-10 text-sm text-mute">Loading…</div>;

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0] ?? null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-2xl font-bold text-ink">Messages</h1>

      {rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-dashed border-mute/30 bg-surface p-12 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">No conversations yet</p>
          <p className="mt-1 text-mute">
            <Link href="/" className="text-primary hover:underline">Browse houses</Link> and message a landlord to
            start one.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-[280px_1fr]">
          <div className="space-y-1.5">
            {rows.map((row) => (
              <button
                key={row.id}
                onClick={() => router.push(`/messages?c=${row.id}`)}
                className={`block w-full rounded-xl px-3 py-2.5 text-left text-sm shadow-sm transition-colors ${
                  selected?.id === row.id ? "bg-primary-light" : "bg-surface hover:bg-mute/5"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-semibold text-ink">{row.otherParty}</p>
                  {row.unreadCount > 0 && (
                    <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {row.unreadCount}
                    </span>
                  )}
                </div>
                <p className="truncate text-xs text-mute">{row.listing.title}</p>
                {row.lastMessage && <p className="mt-0.5 truncate text-xs text-ink/60">{row.lastMessage}</p>}
              </button>
            ))}
          </div>

          <div>
            {selected ? (
              <div>
                <div className="mb-2 flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-ink">{selected.otherParty}</p>
                  <Link href={`/listings/${selected.listing.id}`} className="text-xs text-primary hover:underline">
                    {selected.listing.title}
                  </Link>
                </div>
                <ChatPanel conversationId={selected.id} currentUserId={myUserId} />
              </div>
            ) : (
              <p className="text-sm text-mute">Select a conversation.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
