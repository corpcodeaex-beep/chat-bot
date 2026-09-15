import { Lock, Plus } from "lucide-react";
import Link from "next/link";
import ActivityCharts from "@/components/ActivityCharts";
import AdminOverview from "@/components/admin/AdminOverview";
import { getCompanyActivity } from "@/lib/activity";
import BotCards from "@/components/BotCards";
import PlanFeatures from "@/components/PlanFeatures";
import UsageBar from "@/components/UsageBar";
import { getClient } from "@/lib/clients";
import { getStats, listBots, listLeads } from "@/lib/db";
import { formatDate, formatDay, whatsappLink } from "@/lib/format";
import { getPlan, planPriceLabel } from "@/lib/plans";
import { pageViewer } from "@/lib/session";
import { effectiveLimit, getCompanyMonthUsage } from "@/lib/usage";

export default async function DashboardPage() {
  const viewer = await pageViewer();
  if (viewer.role === "admin") return <AdminOverview />;

  const [bots, stats, leads, company, usage, activity] = await Promise.all([
    listBots(viewer.clientId),
    getStats(viewer.clientId),
    listLeads(undefined, 10, viewer.clientId),
    getClient(viewer.clientId),
    getCompanyMonthUsage(viewer.clientId),
    getCompanyActivity(viewer.clientId),
  ]);
  const plan = getPlan(company?.plan ?? "standard");
  const botLimitReached = plan.maxBots !== null && bots.length >= plan.maxBots;
  const botNames = Object.fromEntries(bots.map((b) => [b.id, b.businessName]));

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Assistants", value: plan.maxBots === null ? `${stats.bots}` : `${stats.bots} of ${plan.maxBots}` },
          { label: "Conversations", value: stats.conversations },
          { label: "Leads (this week)", value: `${stats.leads} (${stats.leadsThisWeek})` },
          { label: "Need a human", value: stats.needsHuman },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Your {plan.label} plan</h2>
            <span className="text-sm text-slate-500">
              {planPriceLabel(plan)}
              {company?.trialEndsAt ? ` · trial until ${formatDay(company.trialEndsAt)}` : ""}
            </span>
          </div>
          <PlanFeatures plan={plan} messageLimit={company?.messageLimit} botsUsed={bots.length} />
          <p className="text-xs text-slate-500">To change your plan, contact your provider.</p>
        </div>
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">Replies this month</h2>
          <UsageBar used={usage.messages} limit={company ? effectiveLimit(company) : null} />
          <p className="text-xs text-slate-500">Shared by all your assistants. It resets at the start of each month.</p>
        </div>
      </section>

      <ActivityCharts activity={activity} />

      <section>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Your assistants</h2>
          {botLimitReached ? (
            <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-100 px-4 py-2 text-sm text-slate-500">
              <Lock className="h-4 w-4" aria-hidden />
              {plan.label} plan limit reached ({plan.maxBots} {plan.maxBots === 1 ? "assistant" : "assistants"})
            </span>
          ) : (
            <Link href="/dashboard/new" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
              <Plus className="h-4 w-4" aria-hidden />
              New assistant
            </Link>
          )}
        </div>
        {bots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
            <p>You don&apos;t have any assistants yet.</p>
            <Link href="/dashboard/new" className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
              <Plus className="h-4 w-4" aria-hidden />
              Create your first assistant
            </Link>
          </div>
        ) : (
          <BotCards bots={bots} perBot={stats.perBot} />
        )}
      </section>

      {leads.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Latest leads</h2>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">When</th>
                  <th className="px-4 py-2 font-medium">Assistant</th>
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Phone</th>
                  <th className="px-4 py-2 font-medium">Wants</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100">
                    <td className="whitespace-nowrap px-4 py-2 text-slate-500">{formatDate(lead.createdAt)}</td>
                    <td className="px-4 py-2">{botNames[lead.botId]}</td>
                    <td className="px-4 py-2">{lead.name ?? "-"}</td>
                    <td className="whitespace-nowrap px-4 py-2">
                      {lead.phone ? (
                        <a href={whatsappLink(lead.phone)} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline">
                          {lead.phone}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4 py-2 text-slate-600" dir="auto">
                      {lead.need ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
