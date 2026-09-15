import { Bell, MessageCircle } from "lucide-react";

// A drawn illustration of the dashboard (sample data), not a live screen.

const BARS = [3, 5, 4, 7, 6, 9, 8, 11, 10, 13, 12, 15, 14, 17];
const LEADS = [
  { name: "Ayesha Khan", need: "Root canal checkup, tomorrow 6pm", time: "2 min ago" },
  { name: "Bilal Ahmed", need: "5 marla house, Bahria Town", time: "18 min ago" },
  { name: "Sana Tariq", need: "Bridal makeup, 15 December", time: "1 hr ago" },
];

export default function DashboardPreview({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const max = Math.max(...BARS);
  const frame =
    tone === "light"
      ? "rounded-3xl border border-white/80 bg-white/60 p-2 shadow-2xl shadow-slate-900/20 ring-1 ring-mk-secondary/60 backdrop-blur"
      : "rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl shadow-black/40 backdrop-blur";
  return (
    <div aria-hidden className={frame}>
      <div className="overflow-hidden rounded-2xl bg-white text-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
          </div>
          <span className="relative text-slate-500">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500" />
          </span>
        </div>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Chats this week", value: "128" },
              { label: "New leads", value: "37" },
              { label: "Replies used", value: "412 / 5,000" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl border border-slate-200 p-3">
                <p className="text-[11px] text-slate-500">{s.label}</p>
                <p className="mt-1 text-base font-semibold sm:text-lg">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-700">Leads per day</p>
            <div className="mt-3 flex h-24 items-end gap-[3px] border-b border-slate-200">
              {BARS.map((v, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${(v / max) * 100}%`, background: "#2a78d6" }} />
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200">
            <p className="border-b border-slate-100 px-3 py-2 text-xs font-medium text-slate-700">Latest leads</p>
            <ul className="divide-y divide-slate-100">
              {LEADS.map((lead) => (
                <li key={lead.name} className="flex items-center gap-3 px-3 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-slate-700">
                    {lead.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium">{lead.name}</p>
                    <p className="truncate text-[11px] text-slate-500">{lead.need}</p>
                  </div>
                  <span className="hidden text-[11px] text-slate-400 sm:inline">{lead.time}</span>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                    <MessageCircle className="h-3 w-3" />
                    WhatsApp
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
