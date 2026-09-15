"use client";

import { useState } from "react";
import type { ActivityDay } from "@/lib/activity";

// Chats and leads per day, as two single-series column charts (one y-axis each).
// Bar color is the validated sequential blue; text always uses text colors.

const BAR = "#2a78d6";
const BAR_HOVER = "#5b9be6";
const GRID = "#e1e0d9";
const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

const dayLabel = (date: string) =>
  new Date(`${date}T12:00:00+05:00`).toLocaleDateString("en-PK", { day: "numeric", month: "short", timeZone: "Asia/Karachi" });

/** Clean top value with an even midpoint: 4, 8, 30, 200... */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const unit = value < 10 ? 1 : value < 100 ? 5 : 10 ** (Math.floor(Math.log10(value)) - 1) * 5;
  return Math.ceil(value / (2 * unit)) * 2 * unit;
}

function ColumnChart({ title, unit, days, values }: { title: string; unit: [string, string]; days: string[]; values: number[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = niceMax(Math.max(...values, 0));
  const total = values.reduce((s, v) => s + v, 0);
  const n = values.length;
  const name = (v: number) => (v === 1 ? unit[0] : unit[1]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowLeft") setHover((h) => Math.max(0, (h ?? n) - 1));
    else if (e.key === "ArrowRight") setHover((h) => Math.min(n - 1, (h ?? -1) + 1));
    else return;
    e.preventDefault();
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <span className="text-sm text-slate-600">
          <b className="text-slate-900">{total.toLocaleString("en-PK")}</b> {name(total)}
        </span>
      </div>

      <div className="flex gap-2">
        <div className="relative h-40 w-8 shrink-0 text-right text-[11px] tabular-nums text-slate-500" aria-hidden>
          <span className="absolute right-0 top-0 -translate-y-1/2">{max}</span>
          <span className="absolute right-0 top-1/2 -translate-y-1/2">{max / 2}</span>
          <span className="absolute bottom-0 right-0 translate-y-1/2">0</span>
        </div>
        <div
          role="group"
          tabIndex={0}
          aria-label={`${title}, ${n} days. Use the left and right arrow keys to read each day.`}
          onKeyDown={onKeyDown}
          onFocus={() => setHover((h) => h ?? n - 1)}
          onBlur={() => setHover(null)}
          className="relative h-40 min-w-0 flex-1 rounded outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
        >
          {[0, 50, 100].map((top) => (
            <div key={top} className="absolute inset-x-0 h-px" style={{ top: `${top}%`, background: GRID }} aria-hidden />
          ))}
          <div className="absolute inset-0 flex items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
            {values.map((value, i) => (
              <div key={days[i]} className="flex h-full min-w-0 flex-1 items-end justify-center" onPointerEnter={() => setHover(i)}>
                {value > 0 && (
                  <div
                    className="w-full max-w-6 rounded-t"
                    style={{ height: `${(value / max) * 100}%`, background: hover === i ? BAR_HOVER : BAR }}
                  />
                )}
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              role="status"
              className="pointer-events-none absolute bottom-full z-10 mb-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow"
              style={{ left: `${Math.min(88, Math.max(12, ((hover + 0.5) / n) * 100))}%` }}
            >
              <b className="text-sm">{values[hover]}</b> {name(values[hover])}
              <span className="text-slate-300"> · {dayLabel(days[hover])}</span>
            </div>
          )}
        </div>
      </div>

      <div className="ml-10 flex justify-between text-[11px] text-slate-500" aria-hidden>
        <span>{dayLabel(days[0])}</span>
        {n > 2 && <span>{dayLabel(days[Math.floor(n / 2)])}</span>}
        <span>Today</span>
      </div>
    </section>
  );
}

export default function ActivityCharts({ activity }: { activity: ActivityDay[] }) {
  const [range, setRange] = useState<Range>(30);
  const shown = activity.slice(-range);
  const days = shown.map((d) => d.date);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Activity</h2>
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm" role="group" aria-label="Date range">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`rounded-md px-3 py-1.5 ${range === r ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              Last {r} days
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ColumnChart title="Chats per day" unit={["chat", "chats"]} days={days} values={shown.map((d) => d.chats)} />
        <ColumnChart title="Leads per day" unit={["lead", "leads"]} days={days} values={shown.map((d) => d.leads)} />
      </div>

      <details className="rounded-xl border border-slate-200 bg-white">
        <summary className="cursor-pointer px-5 py-3 text-sm text-slate-600">Show as table</summary>
        <div className="max-h-72 overflow-y-auto border-t border-slate-100">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Day</th>
                <th className="px-5 py-2 text-right font-medium">Chats</th>
                <th className="px-5 py-2 text-right font-medium">Leads</th>
              </tr>
            </thead>
            <tbody>
              {[...shown].reverse().map((d) => (
                <tr key={d.date} className="border-t border-slate-100">
                  <td className="px-5 py-1.5">{dayLabel(d.date)}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{d.chats}</td>
                  <td className="px-5 py-1.5 text-right tabular-nums">{d.leads}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
