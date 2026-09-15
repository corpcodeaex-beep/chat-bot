import { MessagesSquare, Target } from "lucide-react";
import Link from "next/link";
import TemplateIcon from "./TemplateIcon";
import UsageBar from "./UsageBar";
import { getPlan } from "@/lib/plans";
import { getTemplate } from "@/lib/templates";
import type { Bot } from "@/lib/types";
import { effectiveLimit } from "@/lib/usage";

interface Props {
  bots: Bot[];
  perBot: Record<string, { conversations: number; leads: number; messagesThisMonth: number; limitUsed: number }>;
  /** Admin view: company name per clientId. */
  companyNames?: Record<string, string>;
}

export default function BotCards({ bots, perBot, companyNames }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {bots.map((bot) => {
        const counts = perBot[bot.id];
        const owner = companyNames ? (bot.clientId ? (companyNames[bot.clientId] ?? "Unknown company") : "Your demo bot") : undefined;
        return (
          <Link
            key={bot.id}
            href={`/dashboard/bots/${bot.id}`}
            className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${bot.color}22`, color: bot.color }}>
                <TemplateIcon icon={getTemplate(bot.template).icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{bot.businessName}</div>
                <div className="truncate text-xs text-slate-500">
                  {owner ? `${owner} · ` : ""}
                  {getPlan(bot.plan).label} plan{bot.status === "paused" ? " · paused" : ""}
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <MessagesSquare className="h-4 w-4 text-slate-400" aria-hidden />
                {counts?.conversations ?? 0} chats
              </span>
              <span className="flex items-center gap-1.5">
                <Target className="h-4 w-4 text-slate-400" aria-hidden />
                {counts?.leads ?? 0} leads
              </span>
            </div>
            <UsageBar used={counts?.limitUsed ?? 0} limit={effectiveLimit(bot)} />
          </Link>
        );
      })}
    </div>
  );
}
