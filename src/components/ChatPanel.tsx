"use client";

import { useEffect, useRef, useState } from "react";
import type { MessageDto } from "@/types";

export default function ChatPanel({ conversationId, currentUserId }: { conversationId: string; currentUserId?: string }) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState("");
  const [myUserId, setMyUserId] = useState<string | null>(currentUserId ?? null);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`);
    if (res.ok) setMessages(await res.json());
  }

  useEffect(() => {
    if (currentUserId) return; // already known — skip the redundant round-trip
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => setMyUserId(profile?.id ?? null));
  }, [currentUserId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000); // simple polling for MVP
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!draft.trim()) return;
    const content = draft;
    setDraft("");
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId, content })
    });
    if (res.ok) loadMessages();
  }

  return (
    <div className="flex h-96 flex-col rounded-2xl border border-ink/10 bg-white shadow-soft">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.senderId === myUserId;
          return (
            <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
              <div
                className={`max-w-[75%] rounded-xl px-3 py-2 text-sm shadow-sm ${
                  mine ? "bg-primary text-white" : "bg-mute/10 text-ink"
                }`}
              >
                {m.content}
              </div>
              <span className="mt-0.5 px-1 text-[11px] text-mute">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
        {messages.length === 0 && (
          <p className="py-8 text-center text-sm text-mute">
            No messages yet — say hello and ask about viewing, price, or availability.
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-ink/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message about payment, viewing, or booking..."
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-body shadow-sm transition-all duration-150 ease-smooth focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          onClick={sendMessage}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:bg-primary-dark hover:shadow-card"
        >
          Send
        </button>
      </div>
    </div>
  );
}
