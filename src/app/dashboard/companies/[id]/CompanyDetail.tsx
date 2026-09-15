"use client";

import { ArrowLeft, ChevronRight, CircleCheck, CirclePause, KeyRound, Plus, Save, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AccessBadge from "@/components/AccessBadge";
import CompanyStatusBadge from "@/components/admin/CompanyStatusBadge";
import CredentialsBox, { type Credentials } from "@/components/admin/CredentialsBox";
import PlanFeatures from "@/components/PlanFeatures";
import TemplateIcon from "@/components/TemplateIcon";
import UsageBar from "@/components/UsageBar";
import type { CompanySummary } from "@/lib/clients";
import { dateInputValue, formatDay, formatNumber } from "@/lib/format";
import { getPlan, PLAN_KEYS, PLANS, planPriceLabel } from "@/lib/plans";
import { getTemplate } from "@/lib/templates";
import type { AccessState } from "@/lib/usage";

interface CompanyBot {
  id: string;
  businessName: string;
  template: string;
  color: string;
  access: AccessState;
  trialEndsAt?: string;
  replies: number;
  documents: number;
}

interface Props {
  company: CompanySummary;
  access: AccessState;
  limit: number | null;
  bots: CompanyBot[];
  loginUrl: string;
  templates: { key: string; label: string }[];
}

type Section = "status" | "details" | "password" | "plan" | "bot" | "delete";

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";
const card = "space-y-4 rounded-xl border border-slate-200 bg-white p-5";
const primaryButton =
  "flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50";

export default function CompanyDetail({ company, access, limit, bots, loginUrl, templates }: Props) {
  const router = useRouter();
  const [details, setDetails] = useState({ name: company.name, email: company.email });
  const [password, setPassword] = useState("");
  const [billing, setBilling] = useState({
    plan: company.plan,
    trialEndsAt: dateInputValue(company.trialEndsAt),
    messageLimit: company.messageLimit === undefined ? "" : String(company.messageLimit),
  });
  const [newBotTemplate, setNewBotTemplate] = useState(templates[0]?.key ?? "general");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [notice, setNotice] = useState<{ section: Section; type: "ok" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState<Section | null>(null);

  const isActive = company.status === "active";
  const plan = getPlan(company.plan);
  const selectedPlan = getPlan(billing.plan);

  async function patch(section: Section, body: object, success: string) {
    setBusy(section);
    setNotice(null);
    const res = await fetch(`/api/admin/clients/${company.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok) {
      setNotice({ section, type: "error", text: data.error ?? "Could not save" });
      return null;
    }
    setNotice({ section, type: "ok", text: success });
    router.refresh();
    return data;
  }

  function toggleStatus() {
    if (isActive && !confirm(`Make ${company.name} inactive? They can't log in and all their bots stop answering customers.`)) return;
    patch("status", { status: isActive ? "inactive" : "active" }, isActive ? "Company is now inactive" : "Company is active again");
  }

  async function changePassword(generate: boolean) {
    const data = await patch("password", generate ? { resetPassword: true } : { password }, "Password changed. Old logins were signed out.");
    if (data?.password) {
      setCredentials({ title: `New login details for ${company.name}`, email: data.company.email, password: data.password });
      setPassword("");
    }
  }

  async function addBot() {
    setBusy("bot");
    setNotice(null);
    const res = await fetch("/api/admin/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: newBotTemplate, businessName: company.name, clientId: company.id }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setBusy(null);
      return setNotice({ section: "bot", type: "error", text: data.error ?? "Could not create the bot" });
    }
    router.push(`/dashboard/bots/${data.bot.id}`);
  }

  async function remove() {
    if (!confirm(`Delete ${company.name}? Their login is removed. Their ${company.botCount} bots are kept and become your own demo bots.`)) return;
    setBusy("delete");
    await fetch(`/api/admin/clients/${company.id}`, { method: "DELETE" });
    router.push("/dashboard/companies");
    router.refresh();
  }

  const noticeFor = (section: Section) =>
    notice?.section === section ? (
      <p className={`text-sm ${notice.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>{notice.text}</p>
    ) : null;

  return (
    <div className="space-y-6">
      <Link href="/dashboard/companies" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All companies
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold">{company.name}</h1>
            <CompanyStatusBadge status={company.status} />
            {isActive && access !== "active" && <AccessBadge access={access} trialEndsAt={company.trialEndsAt} size="sm" />}
          </div>
          <p className="text-sm text-slate-500">
            {company.email} · {plan.label} plan ({planPriceLabel(plan)}) · added {formatDay(company.createdAt)}
          </p>
        </div>
        <div className="space-y-1 text-right">
          <button
            onClick={toggleStatus}
            disabled={busy === "status"}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 ${
              isActive ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50" : "bg-emerald-600 text-white hover:bg-emerald-700"
            }`}
          >
            {isActive ? <CirclePause className="h-4 w-4" aria-hidden /> : <CircleCheck className="h-4 w-4" aria-hidden />}
            {isActive ? "Make inactive" : "Make active"}
          </button>
          {noticeFor("status")}
        </div>
      </div>

      {!isActive && (
        <p className="rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700">
          This company is inactive: it cannot log in and its bots reply &quot;not available right now&quot; to customers.
        </p>
      )}

      {credentials && <CredentialsBox credentials={credentials} loginUrl={loginUrl} onClose={() => setCredentials(null)} />}

      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {[
          { label: "Bots", value: plan.maxBots === null ? `${company.botCount}` : `${company.botCount} of ${plan.maxBots}`, detail: `${company.activeBots} active` },
          { label: "Replies this month", value: formatNumber(company.repliesThisMonth), detail: limit === null ? "unlimited" : `of ${formatNumber(limit)}` },
          { label: "Documents", value: formatNumber(company.documentCount), detail: "files, texts and website pages" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-sm text-slate-500">{s.label}</div>
            <div className="mt-1 text-2xl font-semibold">{s.value}</div>
            <div className="mt-1 text-xs text-slate-500">{s.detail}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold">Plan</h2>
            <span className="text-sm text-slate-500">All bots of this company share it</span>
          </div>
          <UsageBar used={company.repliesThisMonth} limit={limit} />
          <label className="block space-y-1">
            <span className="text-sm font-medium">Plan</span>
            <select className={inputClass} value={billing.plan} onChange={(e) => setBilling({ ...billing, plan: e.target.value })}>
              {PLAN_KEYS.map((key) => (
                <option key={key} value={key}>
                  {PLANS[key].label}: {planPriceLabel(PLANS[key])}
                </option>
              ))}
            </select>
          </label>
          <PlanFeatures
            plan={selectedPlan}
            messageLimit={billing.messageLimit === "" ? undefined : Number(billing.messageLimit)}
            botsUsed={company.botCount}
          />
          <div className="grid grid-cols-2 gap-4">
            <label className="block space-y-1">
              <span className="text-sm font-medium">Free trial ends</span>
              <input type="date" className={inputClass} value={billing.trialEndsAt} onChange={(e) => setBilling({ ...billing, trialEndsAt: e.target.value })} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-medium">Custom reply limit</span>
              <input
                type="number"
                min={0}
                className={inputClass}
                value={billing.messageLimit}
                onChange={(e) => setBilling({ ...billing, messageLimit: e.target.value })}
                placeholder="Plan default"
              />
            </label>
          </div>
          <p className="text-xs text-slate-500">Clear the trial date once the company pays. Leave the limit empty to use the plan&apos;s.</p>
          <button onClick={() => patch("plan", billing, "Plan saved")} disabled={busy === "plan"} className={primaryButton}>
            <Save className="h-4 w-4" aria-hidden />
            Save plan
          </button>
          {noticeFor("plan")}
        </section>

        <section className={card}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">Bots</h2>
            <span className="text-sm text-slate-500">The company can also create its own</span>
          </div>
          {bots.length === 0 ? (
            <p className="text-sm text-slate-500">No bots yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {bots.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: `${b.color}22`, color: b.color }}>
                    <TemplateIcon icon={getTemplate(b.template).icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{b.businessName}</div>
                    <div className="text-xs text-slate-500">
                      {formatNumber(b.replies)} replies this month · {b.documents} {b.documents === 1 ? "document" : "documents"}
                    </div>
                  </div>
                  {b.access !== "active" && <AccessBadge access={b.access} trialEndsAt={b.trialEndsAt} size="sm" />}
                  <Link href={`/dashboard/bots/${b.id}`} className="inline-flex items-center gap-1 text-sm text-indigo-700 hover:underline">
                    Open
                    <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap items-end gap-3 border-t border-slate-100 pt-4">
            <label className="min-w-48 flex-1 space-y-1">
              <span className="text-sm font-medium">Add a bot for them</span>
              <select className={inputClass} value={newBotTemplate} onChange={(e) => setNewBotTemplate(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.key} value={t.key}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={addBot} disabled={busy === "bot"} className={primaryButton}>
              <Plus className="h-4 w-4" aria-hidden />
              {busy === "bot" ? "Creating..." : "Create bot"}
            </button>
          </div>
          {noticeFor("bot")}
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="font-semibold">Company details</h2>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Company name</span>
            <input className={inputClass} value={details.name} onChange={(e) => setDetails({ ...details, name: e.target.value })} />
          </label>
          <label className="block space-y-1">
            <span className="text-sm font-medium">Login email</span>
            <input className={inputClass} type="email" value={details.email} onChange={(e) => setDetails({ ...details, email: e.target.value })} />
          </label>
          <button onClick={() => patch("details", details, "Saved")} disabled={busy === "details"} className={primaryButton}>
            <Save className="h-4 w-4" aria-hidden />
            Save details
          </button>
          {noticeFor("details")}
        </section>

        <section className={card}>
          <h2 className="font-semibold">Password</h2>
          <p className="text-sm text-slate-500">Setting a new password signs the company out of all devices.</p>
          <input
            className={inputClass}
            type="text"
            autoComplete="off"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password (at least 8 characters)"
          />
          <div className="flex flex-wrap gap-2">
            <button onClick={() => changePassword(false)} disabled={busy === "password" || password.length < 8} className={primaryButton}>
              <KeyRound className="h-4 w-4" aria-hidden />
              Set password
            </button>
            <button
              onClick={() => changePassword(true)}
              disabled={busy === "password"}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4" aria-hidden />
              Generate
            </button>
          </div>
          {noticeFor("password")}
        </section>
      </div>

      <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white p-5">
        <div>
          <h2 className="font-semibold text-red-700">Delete company</h2>
          <p className="text-sm text-slate-500">Removes the login. Bots, chats and leads are kept and become your own.</p>
        </div>
        <button
          onClick={remove}
          disabled={busy === "delete"}
          className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          Delete company
        </button>
      </section>
    </div>
  );
}
