"use client";

import { CircleCheck, RotateCcw, SendHorizontal, TriangleAlert, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import RichText from "./RichText";

interface Message {
  role: "user" | "assistant" | "notice";
  content: string;
  kind?: "lead" | "handoff" | "error";
}

const NOTICE_ICONS = { lead: CircleCheck, handoff: UserRound, error: TriangleAlert };

export interface ChatReply {
  conversationId: string;
  reply: string;
  leadCaptured: boolean;
  handoff: boolean;
}

interface Props {
  botId: string;
  businessName: string;
  color: string;
  welcome: string;
  /** Remember the conversation in this browser (on for the website widget). */
  persist?: boolean;
  /** Inside the website widget iframe: shows a close button. */
  embedded?: boolean;
  /** Show "lead saved" / "handoff" notes (for the dashboard test chat). */
  showNotices?: boolean;
  pageUrl?: string;
  onReply?: (reply: ChatReply) => void;
}

function NoticeLine({ message }: { message: Message }) {
  const Icon = message.kind ? NOTICE_ICONS[message.kind] : null;
  const tone = message.kind === "error" ? "text-red-600" : message.kind === "lead" ? "text-emerald-700" : "text-slate-500";
  return (
    <div className={`flex items-center justify-center gap-1.5 text-xs ${tone}`}>
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      {message.content}
    </div>
  );
}

export default function ChatWindow({
  botId,
  businessName,
  color,
  welcome,
  persist = false,
  embedded = false,
  showNotices = false,
  pageUrl,
  onReply,
}: Props) {
  const storageKey = `chatdesk:${botId}`;
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: welcome }]);
  const [conversationId, setConversationId] = useState<string>();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!persist) return;
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null");
      if (saved?.conversationId && Array.isArray(saved.messages)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring browser-only state after hydration
        setConversationId(saved.conversationId);
        setMessages(saved.messages);
      }
    } catch {
      // Storage blocked (private mode): start fresh.
    }
  }, [persist, storageKey]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send() {
    const content = input.trim();
    if (!content || loading) return;
    const withUser: Message[] = [...messages, { role: "user", content }];
    setMessages(withUser);
    setInput("");
    setLoading(true);

    let updated: Message[];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ botId, message: content, conversationId, pageUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        updated = [...withUser, { role: "notice", kind: "error", content: data.error ?? "Something went wrong. Please try again." }];
      } else {
        const reply = data as ChatReply;
        updated = [...withUser, { role: "assistant", content: reply.reply }];
        if (showNotices && reply.leadCaptured) updated.push({ role: "notice", kind: "lead", content: "Lead saved to dashboard" });
        if (showNotices && reply.handoff) updated.push({ role: "notice", kind: "handoff", content: "Marked as needing a human" });
        setConversationId(reply.conversationId);
        if (persist) {
          try {
            localStorage.setItem(storageKey, JSON.stringify({ conversationId: reply.conversationId, messages: updated }));
          } catch {
            // Ignore storage errors.
          }
        }
        onReply?.(reply);
      }
    } catch {
      updated = [...withUser, { role: "notice", kind: "error", content: "No internet connection. Please try again." }];
    }
    setMessages(updated);
    setLoading(false);
  }

  function restart() {
    setMessages([{ role: "assistant", content: welcome }]);
    setConversationId(undefined);
    if (persist) {
      try {
        localStorage.removeItem(storageKey);
      } catch {
        // Ignore storage errors.
      }
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-white">
      <header className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: color }}>
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-lg font-semibold">
          {businessName.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold leading-tight">{businessName}</div>
          <div className="flex items-center gap-1.5 text-xs text-white/85">
            <span className="h-2 w-2 rounded-full bg-green-300" /> Online, replies instantly
          </div>
        </div>
        <button
          onClick={restart}
          title="Start a new chat"
          className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-white/90 hover:bg-white/15"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          New chat
        </button>
        {embedded && (
          <button
            onClick={() => window.parent.postMessage("chatdesk:close", "*")}
            aria-label="Close chat"
            className="rounded-md p-1 hover:bg-white/15"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        )}
      </header>

      <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-3 py-4">
        {messages.map((m, i) =>
          m.role === "notice" ? (
            <NoticeLine key={i} message={m} />
          ) : (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                dir="auto"
                className={`max-w-[85%] break-words rounded-2xl px-3.5 py-2 text-[14.5px] leading-relaxed shadow-sm ${
                  m.role === "user" ? "whitespace-pre-wrap rounded-br-md text-white" : "rounded-bl-md bg-white text-slate-800"
                }`}
                style={m.role === "user" ? { background: color } : undefined}
              >
                {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
              </div>
            </div>
          ),
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-end gap-2 border-t border-slate-200 bg-white p-3"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          dir="auto"
          rows={1}
          maxLength={1000}
          placeholder="Type your message..."
          className="max-h-28 flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-[14.5px] outline-none focus:border-slate-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white disabled:opacity-40"
          style={{ background: color }}
        >
          <SendHorizontal className="h-[18px] w-[18px]" aria-hidden />
        </button>
      </form>
    </div>
  );
}
