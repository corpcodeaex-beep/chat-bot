"use client";

import { Bot, SendHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import RichText from "@/components/RichText";
import type { DemoMessage } from "@/lib/marketing";

/** An animated example conversation that plays in a loop (shown all at once for reduced motion). */
export default function ChatDemo({
  title,
  color,
  messages,
  bodyClassName = "h-[330px]",
}: {
  title: string;
  color: string;
  messages: DemoMessage[];
  bodyClassName?: string;
}) {
  const [shown, setShown] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      timers.push(setTimeout(() => setShown(messages.length), 0));
      return () => timers.forEach(clearTimeout);
    }
    const play = () => {
      let t = 700;
      messages.forEach((message, i) => {
        if (message.from === "bot") {
          timers.push(setTimeout(() => setTyping(true), t));
          t += 1300;
        }
        timers.push(
          setTimeout(() => {
            setTyping(false);
            setShown(i + 1);
          }, t),
        );
        t += message.from === "customer" ? 1000 : 2200;
      });
      timers.push(
        setTimeout(() => {
          setShown(0);
          play();
        }, t + 3500),
      );
    };
    play();
    return () => timers.forEach(clearTimeout);
  }, [messages]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-900/15">
      <div className="flex items-center gap-3 px-4 py-3 text-white" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{title}</p>
          <p className="flex items-center gap-1.5 text-xs text-white/85">
            <span className="h-2 w-2 rounded-full bg-emerald-300" />
            Online, replies instantly
          </p>
        </div>
      </div>

      <div className={`flex ${bodyClassName} flex-col justify-end gap-2 overflow-hidden bg-slate-50 p-4`} aria-live="polite">
        {messages.slice(0, shown).map((m, i) => (
          <div key={i} className={`mk-fade-up flex ${m.from === "customer" ? "justify-end" : "justify-start"}`}>
            <div
              dir="auto"
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed shadow-sm ${
                m.from === "customer" ? "whitespace-pre-wrap rounded-br-md text-white" : "rounded-bl-md bg-white text-slate-800"
              }`}
              style={m.from === "customer" ? { background: color } : undefined}
            >
              {m.from === "bot" ? <RichText text={m.text} /> : m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
              <span className="cb-dot h-2 w-2 rounded-full bg-slate-400" />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-slate-200 bg-white p-3" aria-hidden>
        <div className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-400">Type your message...</div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full text-white" style={{ background: color }}>
          <SendHorizontal className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
