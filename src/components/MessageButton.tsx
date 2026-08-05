"use client";

import { useEffect, useState } from "react";
import ChatPanel from "@/components/ChatPanel";

export default function MessageButton({ listingId }: { listingId: string }) {
  const [visibility, setVisibility] = useState<"loading" | "hidden" | "prompt" | "chat">("loading");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => setVisibility(profile?.role === "TENANT" ? "prompt" : "hidden"));
  }, []);

  async function startConversation() {
    setStarting(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId })
      });
      if (res.ok) {
        const conversation = await res.json();
        setConversationId(conversation.id);
        setVisibility("chat");
      }
    } finally {
      setStarting(false);
    }
  }

  if (visibility === "loading" || visibility === "hidden") return null;

  if (visibility === "chat" && conversationId) {
    return (
      <div>
        <p className="mb-2 text-sm font-semibold text-ink">Message the landlord</p>
        <ChatPanel conversationId={conversationId} />
      </div>
    );
  }

  return (
    <button
      onClick={startConversation}
      disabled={starting}
      className="rounded-full bg-surface px-5 py-2.5 text-sm font-semibold text-ink shadow-sm ring-1 ring-ink/10 transition-colors hover:bg-mute/5 disabled:opacity-50"
    >
      {starting ? "Starting…" : "Message the landlord"}
    </button>
  );
}
