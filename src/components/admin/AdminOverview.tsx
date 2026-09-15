import { CircleCheck, Plus, TriangleAlert, UserPlus, Users } from "lucide-react";
import Link from "next/link";
import BarList from "./BarList";
import { providerStatus } from "@/lib/ai";
import { getPlatformOverview, type AttentionKind } from "@/lib/admin-stats";
import { formatMonth, formatNumber } from "@/lib/format";
import { PLAN_KEYS, PLANS, planPriceLabel } from "@/lib/plans";

const SEVERITY: Record<AttentionKind, { label: string; tone: string }> = {
  limit_reached: { label: "Limit reached", tone: "text-red-700 bg-red-50" },
  trial_ended: { label: "Trial ended", tone: "text-red-700 bg-red-50" },
  whatsapp_error: { label: "WhatsApp error", tone: "text-red-700 bg-red-50" },
  near_limit: { label: "Near limit", tone: "text-amber-800 bg-amber-50" },
  trial_ending: { label: "Trial ending", tone: "text-amber-800 bg-amber-50" },
};

function StatTile({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
      <div className="mt-1 text-xs text-slate-500">{detail}</div>
    </div>
  );
}

export default async function AdminOverview() {
  const [o, provider] = await Promise.all([getPlatformOverview(), Promise.resolve(providerStatus())]);

  return (
    <div className="space-y-8">
      {provider.warning && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{provider.warning}</div>}
      {provider.active === "demo" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <b>Demo mode (no AI key).</b> Add a <code>GEMINI_API_KEY</code> to <code>.env.local</code> for real AI answers.
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Admin overview</h1>
          <p className="text-sm text-slate-500">All companies, {formatMonth(o.month)}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/companies?new=1" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
            <UserPlus className="h-4 w-4" aria-hidden />
            New company
          </Link>
          <Link href="/dashboard/new" className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm hover:bg-slate-50">
            <Plus className="h-4 w-4" aria-hidden />
            New bot
          </Link>
        </div>
      </div>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6">
          <div className="text-sm text-slate-500">Estimated monthly revenue</div>
          <div className="my-3 text-5xl font-semibold tracking-tight text-slate-900">
            <span className="mr-2 text-2xl font-medium text-slate-500">PKR</span>
            {o.revenue.monthlyPkr.toLocaleString("en-PK")}
          </div>
          <div className="text-xs text-slate-500">
            From {o.revenue.payingCompanies} active {o.revenue.payingCompanies === 1 ? "company" : "companies"} at their plan price. Free
            trials and inactive companies are not counted
            {o.revenue.customPriced ? `; ${o.revenue.customPriced} Enterprise (custom price) not included` : ""}.
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <StatTile
            label="Companies"
            value={formatNumber(o.companies.total)}
            detail={`${o.companies.active} active · ${o.companies.trial} on trial · ${o.companies.inactive} inactive`}
          />
          <StatTile
            label="Bots"
            value={formatNumber(o.bots.total)}
            detail={`${o.bots.active} active · ${o.bots.trial} on trial · ${o.bots.notAnswering} not answering`}
          />
          <StatTile
            label="Replies this month"
            value={formatNumber(o.monthTotals.replies)}
            detail={`${formatNumber(o.monthTotals.inputTokens)} in / ${formatNumber(o.monthTotals.outputTokens)} out tokens · ${o.monthTotals.blocked} not answered`}
          />
          <StatTile
            label="Leads"
            value={formatNumber(o.leads.total)}
            detail={`${o.leads.thisWeek} this week · ${o.needsHuman} chats need a human`}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-4 font-semibold">Needs attention</h2>
          {o.attention.length === 0 ? (
            <p className="flex items-center gap-2 py-4 text-sm text-slate-600">
              <CircleCheck className="h-4 w-4 text-emerald-600" aria-hidden />
              Nothing needs attention right now.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {o.attention.slice(0, 8).map((item) => (
                <li key={item.key} className="flex items-start gap-3 py-2.5">
                  <span className={`mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY[item.kind].tone}`}>
                    <TriangleAlert className="h-3.5 w-3.5" aria-hidden />
                    {SEVERITY[item.kind].label}
                  </span>
                  <div className="min-w-0 text-sm">
                    <Link href={item.href} className="font-medium text-slate-900 hover:underline">
                      {item.title}
                    </Link>
                    {item.subtitle && <span className="text-slate-500"> · {item.subtitle}</span>}
                    <div className="text-slate-600">{item.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Top companies by replies</h2>
            <Link href="/dashboard/companies" className="flex items-center gap-1 text-sm text-indigo-700 hover:underline">
              <Users className="h-4 w-4" aria-hidden />
              All companies
            </Link>
          </div>
          <BarList
            unit="replies this month"
            empty="No replies yet this month."
            items={o.topCompanies.map((c) => ({
              key: c.id,
              label: c.name,
              value: c.replies,
              note: c.status === "inactive" ? "inactive" : undefined,
              href: `/dashboard/companies/${c.id}`,
            }))}
          />
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="mb-4 font-semibold">Companies by plan</h2>
        <BarList
          unit="companies"
          empty="No companies yet."
          items={PLAN_KEYS.map((key) => ({ key, label: PLANS[key].label, note: planPriceLabel(PLANS[key]), value: o.plans[key] }))}
        />
        {o.bots.unassigned > 0 && (
          <p className="mt-4 text-xs text-slate-500">
            {o.bots.unassigned} demo {o.bots.unassigned === 1 ? "bot is" : "bots are"} not linked to a company (not counted in revenue).
          </p>
        )}
      </section>
    </div>
  );
}
