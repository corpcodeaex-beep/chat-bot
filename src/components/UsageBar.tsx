/** Replies used this month against the plan limit. The track is a lighter step of the fill's hue. */
export default function UsageBar({ used, limit }: { used: number; limit: number | null }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const tone = pct >= 100 ? { fill: "bg-red-500", track: "bg-red-100" } : pct >= 80 ? { fill: "bg-amber-500", track: "bg-amber-100" } : { fill: "bg-emerald-500", track: "bg-emerald-100" };
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{used.toLocaleString("en-PK")} replies this month</span>
        <span>{limit === null ? "Unlimited" : `of ${limit.toLocaleString("en-PK")}`}</span>
      </div>
      {limit !== null && (
        <div className={`h-1.5 overflow-hidden rounded-full ${tone.track}`} title={`${pct}% of the monthly limit`}>
          <div className={`h-full rounded-full ${tone.fill}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
