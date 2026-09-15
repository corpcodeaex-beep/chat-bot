"use client";

import { CircleCheck, Mail, MessageCircle, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { formatDate, whatsappLink } from "@/lib/format";
import type { Inquiry } from "@/lib/inquiries";

type Row = Inquiry & { industryName?: string; planName?: string };

export default function InquiriesTable({ inquiries }: { inquiries: Row[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<"open" | "handled" | "all">("open");
  const [busy, setBusy] = useState<string | null>(null);
  const shown = inquiries.filter((i) => filter === "all" || (filter === "open" ? !i.handled : i.handled));

  async function toggle(inquiry: Row) {
    setBusy(inquiry.id);
    await fetch(`/api/admin/inquiries/${inquiry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handled: !inquiry.handled }),
    });
    setBusy(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex w-fit rounded-lg border border-slate-300 bg-white p-0.5 text-sm">
        {(["open", "handled", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-md px-3 py-1.5 capitalize ${filter === f ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {f} ({inquiries.filter((i) => f === "all" || (f === "open" ? !i.handled : i.handled)).length})
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
          {filter === "open" ? "No open demo requests." : "Nothing here yet."}
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((inquiry) => (
            <li key={inquiry.id} className={`rounded-xl border bg-white p-5 ${inquiry.handled ? "border-slate-200 opacity-75" : "border-indigo-200"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {inquiry.name}
                    {inquiry.business && <span className="font-normal text-slate-500"> · {inquiry.business}</span>}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatDate(inquiry.createdAt)}
                    {inquiry.industryName && ` · ${inquiry.industryName}`}
                    {inquiry.planName && ` · interested in ${inquiry.planName}`}
                  </p>
                </div>
                <button
                  onClick={() => toggle(inquiry)}
                  disabled={busy === inquiry.id}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm disabled:opacity-50 ${
                    inquiry.handled ? "border border-slate-300 text-slate-600 hover:bg-slate-50" : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {inquiry.handled ? <RotateCcw className="h-4 w-4" aria-hidden /> : <CircleCheck className="h-4 w-4" aria-hidden />}
                  {inquiry.handled ? "Mark as open" : "Mark as handled"}
                </button>
              </div>
              {inquiry.message && (
                <p className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm text-slate-700" dir="auto">
                  {inquiry.message}
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                <a href={`mailto:${inquiry.email}`} className="flex items-center gap-1.5 text-indigo-700 hover:underline">
                  <Mail className="h-4 w-4" aria-hidden />
                  {inquiry.email}
                </a>
                {inquiry.phone && (
                  <a href={whatsappLink(inquiry.phone)} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-emerald-700 hover:underline">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    {inquiry.phone}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
