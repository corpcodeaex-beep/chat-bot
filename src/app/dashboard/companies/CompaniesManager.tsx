"use client";

import { ChevronRight, Search, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CompanyStatusBadge from "@/components/admin/CompanyStatusBadge";
import CredentialsBox, { type Credentials } from "@/components/admin/CredentialsBox";
import PlanFeatures from "@/components/PlanFeatures";
import type { CompanySummary } from "@/lib/clients";
import { formatDay, formatNumber } from "@/lib/format";
import { getPlan, PLAN_KEYS, PLANS, planPriceLabel } from "@/lib/plans";

interface Props {
  companies: CompanySummary[];
  loginUrl: string;
  templates: { key: string; label: string }[];
  startWithForm: boolean;
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";
const emptyForm = { name: "", email: "", password: "", template: "", plan: "standard", trialEndsAt: "" };

export default function CompaniesManager({ companies, loginUrl, templates, startWithForm }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showForm, setShowForm] = useState(startWithForm);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [credentials, setCredentials] = useState<(Credentials & { companyId: string }) | null>(null);

  const q = query.trim().toLowerCase();
  const visible = companies.filter(
    (c) => (statusFilter === "all" || c.status === statusFilter) && (!q || c.name.toLowerCase().includes(q) || c.email.includes(q)),
  );

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password || undefined,
        template: form.template || undefined,
        plan: form.plan,
        trialEndsAt: form.trialEndsAt,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "Could not create the company");
    setCredentials({ title: `Login details for ${data.client.name}`, email: data.client.email, password: data.password, companyId: data.client.id });
    setForm(emptyForm);
    setShowForm(false);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Companies</h1>
          <p className="text-sm text-slate-500">Every business using your platform. Each company has one login and sees only its own bots.</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" aria-hidden />
            New company
          </button>
        )}
      </div>

      {credentials && (
        <div className="space-y-2">
          <CredentialsBox credentials={credentials} loginUrl={loginUrl} onClose={() => setCredentials(null)} />
          <Link href={`/dashboard/companies/${credentials.companyId}`} className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
            Open this company
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      )}

      {showForm && (
        <form onSubmit={create} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="font-semibold">New company</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-sm font-medium">Company name</span>
              <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Noor's Pharma" />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Login email</span>
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="owner@business.com"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Password</span>
              <input
                className={inputClass}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave empty to generate one"
              />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Plan</span>
              <select className={inputClass} value={form.plan} onChange={(e) => setForm({ ...form, plan: e.target.value })}>
                {PLAN_KEYS.map((key) => (
                  <option key={key} value={key}>
                    {PLANS[key].label}: {planPriceLabel(PLANS[key])}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Free trial ends (optional)</span>
              <input type="date" className={inputClass} value={form.trialEndsAt} onChange={(e) => setForm({ ...form, trialEndsAt: e.target.value })} />
            </label>
            <label className="space-y-1">
              <span className="text-sm font-medium">Create a first bot for them (optional)</span>
              <select className={inputClass} value={form.template} onChange={(e) => setForm({ ...form, template: e.target.value })}>
                <option value="">No, the company will create its own</option>
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    Yes: {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <PlanFeatures plan={getPlan(form.plan)} />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              disabled={busy || !form.name || !form.email}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              <UserPlus className="h-4 w-4" aria-hidden />
              {busy ? "Creating..." : "Create company"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" aria-hidden />
          <input className={`${inputClass} pl-9`} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or email" />
        </label>
        <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-sm">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-md px-3 py-1.5 capitalize ${statusFilter === s ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        {visible.length === 0 ? (
          <p className="p-8 text-center text-sm text-slate-500">{companies.length === 0 ? "No companies yet." : "No companies match your search."}</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Company</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Bots</th>
                <th className="px-4 py-2 font-medium">Plan</th>
                <th className="px-4 py-2 text-right font-medium">Replies this month</th>
                <th className="px-4 py-2 text-right font-medium">Documents</th>
                <th className="px-4 py-2 font-medium">Added</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/companies/${c.id}`} className="font-medium text-slate-900 hover:underline">
                      {c.name}
                    </Link>
                    <div className="text-xs text-slate-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <CompanyStatusBadge status={c.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">
                    {c.botCount}
                    {c.botCount > 0 && c.activeBots < c.botCount && <span className="text-xs text-slate-500"> ({c.activeBots} active)</span>}
                  </td>
                  <td className="px-4 py-3">
                    {getPlan(c.plan).label}
                    {c.trialEndsAt && <div className="text-xs text-slate-500">trial until {formatDay(c.trialEndsAt)}</div>}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.repliesThisMonth)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{formatNumber(c.documentCount)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{formatDay(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/dashboard/companies/${c.id}`} className="inline-flex items-center gap-1 text-indigo-700 hover:underline">
                      Manage
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
