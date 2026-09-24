"use client";

import { MessageCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  role: string;
};

type Conversation = {
  citizenId: string;
  title: string;
  subtitle: string;
};

type Message = {
  id: string;
  body: string;
  sender_id: string;
  created_at: string;
};

export function MessageModal({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedCitizenId, setSelectedCitizenId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  async function loadConversations() {
    const response = await fetch("/api/messages/conversations");
    if (!response.ok) return;

    const data = await response.json();
    setConversations(data.conversations ?? []);
  }
  async function loadUnreadCount() {
  const response = await fetch("/api/messages/unread-count");

  if (!response.ok) return;

  const data = await response.json();

  setUnreadCount(data.unread ?? 0);
}

  async function loadMessages(citizenId: string) {
    setSelectedCitizenId(citizenId);
    setLoading(true);

    const response = await fetch(`/api/messages?citizenId=${citizenId}`);
    if (response.ok) {
      const data = await response.json();
      setMessages(data.messages ?? []);
    }

    setLoading(false);
  }

  async function sendMessage() {
    if (!selectedCitizenId || !body.trim()) return;

    const response = await fetch("/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        citizenId: selectedCitizenId,
        body
      })
    });

    if (!response.ok) return;

    setBody("");
    await loadMessages(selectedCitizenId);
  }

  useEffect(() => {
  loadUnreadCount();

  const interval = setInterval(() => {
    loadUnreadCount();
  }, 10000);

  return () => clearInterval(interval);
}, []);

useEffect(() => {
  if (open) {
    loadConversations();
  }
}, [open]);

  return (
    <>
      <button
  type="button"
  onClick={() => {
    setOpen(true);
    loadUnreadCount();
  }}
  className="relative focus-ring inline-flex items-center gap-2 rounded border border-funktion-line px-3 py-2 text-black hover:bg-funktion-pale"
  title="Beskeder"
>
  <MessageCircle className="h-4 w-4 text-funktion-blue" />

  Beskeder

  {unreadCount > 0 ? (
    <span className="absolute -right-2 -top-2 flex h-6 min-w-[24px] items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
      {unreadCount}
    </span>
  ) : null}
</button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 px-4 py-8">
          <div className="mx-auto grid max-h-[85vh] max-w-5xl overflow-hidden rounded bg-white shadow-xl md:grid-cols-[280px_1fr]">
            <aside className="border-b border-funktion-line p-4 md:border-b-0 md:border-r">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-funktion-blue">
                  Beskeder
                </h2>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded border border-funktion-line p-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 grid gap-2">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <button
                      key={conversation.citizenId}
                      type="button"
                      onClick={() => loadMessages(conversation.citizenId)}
                      className={`rounded border px-3 py-3 text-left text-sm ${
                        selectedCitizenId === conversation.citizenId
                          ? "border-funktion-blue bg-funktion-blue/5"
                          : "border-funktion-line"
                      }`}
                    >
                      <p className="font-semibold text-funktion-blue">
                        {conversation.title}
                      </p>

                      <p className="mt-1 text-xs text-black/60">
                        {conversation.subtitle}
                      </p>
                    </button>
                  ))
                ) : (
                  <p className="rounded border border-funktion-line p-3 text-sm text-black/70">
                    Ingen samtaler endnu.
                  </p>
                )}
              </div>
            </aside>

            <section className="flex max-h-[85vh] min-h-[500px] flex-col">
              <div className="border-b border-funktion-line p-4">
                <h3 className="font-semibold text-funktion-blue">
                  {selectedCitizenId ? "Samtale" : "Vælg en samtale"}
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {loading ? (
                  <p className="text-sm text-black/70">Indlæser beskeder...</p>
                ) : messages.length > 0 ? (
                  <div className="grid gap-3">
                    {messages.map((message) => {
                      const own = message.sender_id === user.id;

                      return (
                        <div
                          key={message.id}
                          className={`max-w-[80%] rounded px-4 py-3 ${
                            own
                              ? "ml-auto bg-funktion-blue text-white"
                              : "mr-auto bg-funktion-pale text-black"
                          }`}
                        >
                          <p className="leading-6">{message.body}</p>

                          <p
                            className={`mt-2 text-xs ${
                              own ? "text-white/70" : "text-black/50"
                            }`}
                          >
                            {new Date(message.created_at).toLocaleString("da-DK")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : selectedCitizenId ? (
                  <p className="text-sm text-black/70">
                    Der er endnu ingen beskeder i denne samtale.
                  </p>
                ) : (
                  <p className="text-sm text-black/70">
                    Vælg en samtale til venstre.
                  </p>
                )}
              </div>

              <div className="border-t border-funktion-line p-4">
                <div className="flex gap-3">
                  <input
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    disabled={!selectedCitizenId}
                    placeholder="Skriv besked..."
                    className="flex-1 rounded border border-funktion-line px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={sendMessage}
                    disabled={!selectedCitizenId || !body.trim()}
                    className="rounded bg-funktion-blue px-5 py-3 font-semibold text-white disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}