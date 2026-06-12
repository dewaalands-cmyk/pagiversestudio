"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Send, Loader2 } from "lucide-react";

interface Message {
  id: number;
  content: string;
  sender_name: string;
  sender_role: string;
  created_at: string;
}

export default function ClientMessagesPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch("/api/messages");
    if (res.ok) setMessages(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text.trim() }),
    });
    setText("");
    await load();
    setSending(false);
  }

  const me = session?.user?.name ?? "";

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-cloud-200 dark:border-white/10 bg-white dark:bg-navy-soft">
        <h1 className="text-lg font-semibold text-navy-deep dark:text-white">Pesan</h1>
        <p className="text-xs text-slate-muted dark:text-slate-label">Chat langsung dengan tim Pagiverse Studio</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-cloud-50 dark:bg-navy-deep">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={22} className="animate-spin text-mint" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-slate-muted dark:text-slate-label py-12 text-sm">
            Belum ada pesan. Mulai percakapan!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_role === "client";
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs lg:max-w-md ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                  <span className="text-xs text-slate-muted dark:text-slate-label px-1">
                    {isMe ? "Saya" : msg.sender_name}
                  </span>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm ${
                      isMe
                        ? "bg-mint text-navy-deep rounded-br-sm"
                        : "bg-white dark:bg-navy-soft text-navy-deep dark:text-white border border-cloud-200 dark:border-white/10 rounded-bl-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                  <span className="text-xs text-slate-muted dark:text-slate-label px-1">
                    {new Date(msg.created_at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 px-6 py-4 bg-white dark:bg-navy-soft border-t border-cloud-200 dark:border-white/10"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ketik pesan..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-cloud-200 dark:border-white/10 bg-cloud-50 dark:bg-navy-deep text-navy-deep dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-mint/50"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="p-2.5 bg-mint hover:bg-mint/90 disabled:opacity-50 text-navy-deep rounded-xl transition-colors"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
}
