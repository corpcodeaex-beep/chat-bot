"use client";

import { Bell, CheckCheck, CircleAlert, Info, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Alert } from "@/lib/alerts";
import { formatDate } from "@/lib/format";

const READ_KEY = "chatdesk:read-alerts";

const STYLE = {
  critical: { icon: TriangleAlert, tone: "text-red-600", label: "Critical" },
  warning: { icon: CircleAlert, tone: "text-amber-600", label: "Warning" },
  info: { icon: Info, tone: "text-slate-500", label: "Info" },
} as const;

export default function NotificationBell({ alerts }: { alerts: Alert[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [clearing, setClearing] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(READ_KEY) ?? "[]");
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring browser-only state after hydration
      if (Array.isArray(saved)) setReadIds(saved);
    } catch {
      // Storage blocked: every alert shows as unread.
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = alerts.filter((a) => !readIds.includes(a.id));
  const hasCritical = unread.some((a) => a.severity === "critical");

  function markAllRead() {
    const ids = alerts.map((a) => a.id);
    setReadIds(ids);
    try {
      localStorage.setItem(READ_KEY, JSON.stringify(ids));
    } catch {
      // Ignore storage errors.
    }
  }

  async function clearAiFailures() {
    setClearing(true);
    await fetch("/api/admin/alerts/ai-failures", { method: "DELETE" });
    setClearing(false);
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={unread.length ? `Notifications, ${unread.length} unread` : "Notifications"}
        aria-expanded={open}
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread.length > 0 && (
          <span
            className={`absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold text-white ${
              hasCritical ? "bg-red-600" : "bg-amber-500"
            }`}
          >
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unread.length > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-indigo-700 hover:underline">
                <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                Mark all as read
              </button>
            )}
          </div>

          {alerts.length === 0 ? (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
              <CheckCheck className="h-4 w-4 text-emerald-600" aria-hidden />
              You&apos;re all caught up.
            </p>
          ) : (
            <ul className="max-h-[70vh] divide-y divide-slate-100 overflow-y-auto">
              {alerts.map((alert) => {
                const style = STYLE[alert.severity];
                const Icon = style.icon;
                const isUnread = !readIds.includes(alert.id);
                return (
                  <li key={alert.id} className={`flex gap-3 px-4 py-3 ${isUnread ? "bg-indigo-50/40" : ""}`}>
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${style.tone}`} aria-label={style.label} />
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="text-sm font-medium text-slate-900">{alert.title}</p>
                      {alert.detail && <p className="line-clamp-4 break-words text-xs text-slate-600">{alert.detail}</p>}
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {alert.at && <span className="text-slate-400">{formatDate(alert.at)}</span>}
                        {alert.href && (
                          <Link href={alert.href} onClick={() => setOpen(false)} className="text-indigo-700 hover:underline">
                            Open
                          </Link>
                        )}
                        {alert.action === "clear-ai-failures" && (
                          <button onClick={clearAiFailures} disabled={clearing} className="text-indigo-700 hover:underline disabled:opacity-50">
                            {clearing ? "Clearing..." : "Clear"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
