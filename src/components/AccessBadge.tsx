import { CalendarClock, CircleCheck, CirclePause, TriangleAlert } from "lucide-react";
import { formatDay } from "@/lib/format";
import type { AccessState } from "@/lib/usage";

/** Whether a bot is answering customers, always shown as icon + text. */
export default function AccessBadge({ access, trialEndsAt, size = "md" }: { access: AccessState; trialEndsAt?: string; size?: "sm" | "md" }) {
  const styles = {
    active: { icon: CircleCheck, text: "Active", tone: "bg-emerald-50 text-emerald-700" },
    trial: { icon: CalendarClock, text: `Trial until ${trialEndsAt ? formatDay(trialEndsAt) : ""}`, tone: "bg-indigo-50 text-indigo-700" },
    trial_ended: { icon: TriangleAlert, text: "Trial ended: not answering", tone: "bg-red-50 text-red-700" },
    paused: { icon: CirclePause, text: "Paused: not answering", tone: "bg-slate-100 text-slate-700" },
    company_inactive: { icon: CirclePause, text: "Company inactive: not answering", tone: "bg-slate-100 text-slate-700" },
  }[access];
  const Icon = styles.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium ${styles.tone} ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon className={size === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"} aria-hidden />
      {styles.text}
    </span>
  );
}
