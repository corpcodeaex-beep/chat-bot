import { CircleCheck, Lock } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { Plan } from "@/lib/plans";

/** What a plan includes; features the plan doesn't have show a lock. */
export default function PlanFeatures({ plan, messageLimit, botsUsed }: { plan: Plan; messageLimit?: number; botsUsed?: number }) {
  const replies = messageLimit ?? plan.monthlyMessages;
  const items = [
    { ok: true, text: replies === null ? "Unlimited replies per month" : `${formatNumber(replies)} replies per month (shared by all bots)` },
    {
      ok: plan.maxBots === null || botsUsed === undefined || botsUsed < plan.maxBots,
      text:
        plan.maxBots === null
          ? "Unlimited bots"
          : `${botsUsed !== undefined ? `${botsUsed} of ` : ""}${plan.maxBots} ${plan.maxBots === 1 ? "bot" : "bots"}${
              botsUsed !== undefined && botsUsed >= plan.maxBots ? " (limit reached)" : ""
            }`,
    },
    { ok: true, text: plan.maxSources === null ? "Unlimited documents and websites" : `Up to ${plan.maxSources} documents or websites per bot` },
    { ok: plan.whatsapp, text: plan.whatsapp ? "WhatsApp channel" : "WhatsApp channel (Pro and Enterprise)" },
  ];
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item) => (
        <li key={item.text} className={`flex items-center gap-2 ${item.ok ? "text-slate-700" : "text-slate-400"}`}>
          {item.ok ? (
            <CircleCheck className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
          ) : (
            <Lock className="h-4 w-4 shrink-0" aria-label="Locked" />
          )}
          {item.text}
        </li>
      ))}
    </ul>
  );
}
