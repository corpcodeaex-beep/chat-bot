import Link from "next/link";
import { formatNumber } from "@/lib/format";

export interface BarListItem {
  key: string;
  label: string;
  value: number;
  /** Extra text after the label, e.g. a price. */
  note?: string;
  href?: string;
}

/** Ranked horizontal bars in one hue; labels and values stay in text colors. */
export default function BarList({ items, unit, empty }: { items: BarListItem[]; unit: string; empty: string }) {
  const max = Math.max(...items.map((i) => i.value), 0);
  if (!items.length || max === 0) return <p className="py-6 text-center text-sm text-slate-500">{empty}</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => {
        const label = (
          <span className="truncate">
            {item.label}
            {item.note && <span className="text-slate-400"> · {item.note}</span>}
          </span>
        );
        return (
          <li key={item.key} title={`${item.label}: ${item.value.toLocaleString("en-PK")} ${unit}`} className="space-y-1">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              {item.href ? (
                <Link href={item.href} className="min-w-0 truncate text-slate-700 hover:underline">
                  {label}
                </Link>
              ) : (
                <span className="min-w-0 truncate text-slate-700">{label}</span>
              )}
              <span className="shrink-0 font-medium tabular-nums text-slate-900">{formatNumber(item.value)}</span>
            </div>
            <div className="h-2">
              {item.value > 0 && (
                <div className="h-full rounded bg-indigo-500" style={{ width: `${Math.max((item.value / max) * 100, 2)}%` }} />
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
