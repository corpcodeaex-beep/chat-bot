"use client";

import { Save, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AccessBadge from "./AccessBadge";
import PlanFeatures from "./PlanFeatures";
import UsageBar from "./UsageBar";
import { dateInputValue, formatNumber } from "@/lib/format";
import { getPlan, PLAN_KEYS, PLANS, planPriceLabel } from "@/lib/plans";
import type { Bot } from "@/lib/types";
import type { AccessState, UsageMonth } from "@/lib/usage";

interface Props {
  bot: Bot;
  isAdmin: boolean;
  /** Monthly history: the company's totals for company bots. */
  usage: UsageMonth[];
  /** This month, counted against the limit (company total for company bots). */
  current: UsageMonth;
  /** This bot's own replies this month. */
  botReplies: number;
  limit: number | null;
  access: AccessState;
  company: { id: string; name: string; botCount: number } | null;
  clients: { id: string; name: string }[];
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 disabled:bg-slate-50 disabled:text-slate-400";

export default function PlanUsagePanel({ bot, isAdmin, usage, current, botReplies, limit, access, company, clients }: Props) {
  const router = useRouter();
  const plan = getPlan(bot.plan);
  const [form, setForm] = useState({
    clientId: bot.clientId ?? "",
    plan: bot.plan,
    status: bot.status,
    trialEndsAt: dateInputValue(bot.trialEndsAt),
    messageLimit: bot.messageLimit === undefined ? "" : String(bot.messageLimit),
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setMessage(null);
  };
  const companyChosen = form.clientId !== "";

  async function save() {
    setSaving(true);
    // For company bots only the owner and pause status are bot settings; plan settings live on the company.
    const body = companyChosen ? { clientId: form.clientId, status: form.status } : form;
    const res = await fetch(`/api/admin/bots/${bot.id}/plan`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    setMessage(res.ok ? { type: "ok", text: "Saved" } : { type: "error", text: data.error ?? "Could not save" });
    if (res.ok) router.refresh();
  }

  const limitReached = limit !== null && current.messages >= limit;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold">This month</h2>
              {company && <p className="text-xs text-slate-500">Replies are shared by all {company.name} bots</p>}
            </div>
            <AccessBadge access={access} trialEndsAt={bot.trialEndsAt} />
          </div>
          <UsageBar used={current.messages} limit={limit} />
          {limitReached && (
            <p className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              The monthly limit is reached. Customers see &quot;not available right now&quot; until next month or a plan upgrade.
            </p>
          )}
          <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {company && (
              <div>
                <dt className="text-slate-500">This bot</dt>
                <dd className="font-semibold">{formatNumber(botReplies)}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500">Not answered</dt>
              <dd className="font-semibold">{formatNumber(current.blocked)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">AI input tokens</dt>
              <dd className="font-semibold">{formatNumber(current.inputTokens)}</dd>
            </div>
            <div>
              <dt className="text-slate-500">AI output tokens</dt>
              <dd className="font-semibold">{formatNumber(current.outputTokens)}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-5 py-3 font-semibold">{company ? "Company history" : "History"}</h2>
          {usage.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">No usage yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-2 font-medium">Month</th>
                    <th className="px-5 py-2 font-medium">Replies</th>
                    <th className="px-5 py-2 font-medium">Not answered</th>
                    <th className="px-5 py-2 font-medium">Tokens (in / out)</th>
                  </tr>
                </thead>
                <tbody>
                  {usage.map((u) => (
                    <tr key={u.month} className="border-t border-slate-100">
                      <td className="px-5 py-2">{u.month}</td>
                      <td className="px-5 py-2">{formatNumber(u.messages)}</td>
                      <td className="px-5 py-2">{formatNumber(u.blocked)}</td>
                      <td className="px-5 py-2 text-slate-600">
                        {formatNumber(u.inputTokens)} / {formatNumber(u.outputTokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <div className="space-y-6">
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">{plan.label} plan</h2>
            <span className="text-sm text-slate-500">{planPriceLabel(plan)}</span>
          </div>
          <p className="text-sm text-slate-600">{plan.description}</p>
          <PlanFeatures plan={plan} messageLimit={bot.messageLimit} botsUsed={company?.botCount} />
          {!isAdmin && <p className="text-xs text-slate-500">To change your plan, contact your provider.</p>}
          {isAdmin && company && (
            <p className="text-xs text-slate-500">
              Plan, free trial and reply limit are set on the company:{" "}
              <Link href={`/dashboard/companies/${company.id}`} className="text-indigo-700 hover:underline">
                open {company.name}
              </Link>
              .
            </p>
          )}
        </section>

        {isAdmin && (
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold">Bot settings</h2>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Company</span>
              <select className={inputClass} value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
                <option value="">No company (your own demo bot)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Status</span>
              <select className={inputClass} value={form.status} onChange={(e) => set("status", e.target.value as Bot["status"])}>
                <option value="active">Active</option>
                <option value="paused">Paused (this bot only)</option>
              </select>
            </label>
            {companyChosen ? (
              <p className="text-xs text-slate-500">This bot uses the company&apos;s plan, free trial and reply limit.</p>
            ) : (
              <>
                <label className="block space-y-1">
                  <span className="text-sm font-medium">Demo plan</span>
                  <select className={inputClass} value={form.plan} onChange={(e) => set("plan", e.target.value)}>
                    {PLAN_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {PLANS[key].label}: {planPriceLabel(PLANS[key])}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="block space-y-1">
                    <span className="text-sm font-medium">Trial ends</span>
                    <input type="date" className={inputClass} value={form.trialEndsAt} onChange={(e) => set("trialEndsAt", e.target.value)} />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-medium">Reply limit</span>
                    <input
                      type="number"
                      min={0}
                      className={inputClass}
                      value={form.messageLimit}
                      onChange={(e) => set("messageLimit", e.target.value)}
                      placeholder="Plan default"
                    />
                  </label>
                </div>
              </>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={save}
                disabled={saving}
                className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4" aria-hidden />
                {saving ? "Saving..." : "Save"}
              </button>
              {message && <span className={message.type === "ok" ? "text-sm text-emerald-700" : "text-sm text-red-600"}>{message.text}</span>}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
