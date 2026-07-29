"use client";

import { useEffect, useRef, useState } from "react";
import type { MessageDto } from "@/types";

export default function ChatPanel({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/messages?conversationId=${conversationId}`);
    if (res.ok) setMessages(await res.json());
  }

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
        {messages.map((m) => (
          <div key={m.id} className="max-w-[75%] rounded-xl bg-mustard/20 px-3 py-2 text-sm shadow-sm">
            {m.content}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 border-t border-ink/10 p-3">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message about payment, viewing, or booking..."
          className="flex-1 rounded-lg border border-ink/15 px-3 py-2 text-sm font-body shadow-sm transition-all duration-150 ease-smooth focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/40"
        />
        <button
          onClick={sendMessage}
          className="rounded-lg bg-clay px-4 py-2 text-sm font-medium text-paper shadow-sm transition-all duration-200 ease-smooth hover:-translate-y-0.5 hover:shadow-card"
        >
          Send
        </button>
      </div>
    </div>
  );
}