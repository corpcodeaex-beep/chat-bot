"use client";

import { ArrowLeft, CalendarDays, FileText, Lock, MessageCircle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import AccessBadge from "./AccessBadge";
import PlanUsagePanel from "./PlanUsagePanel";
import TemplateIcon from "./TemplateIcon";
import WhatsAppPanel, { type WhatsAppInfo } from "./WhatsAppPanel";
import { formatDay, formatNumber } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import type { DocumentCounts } from "@/lib/rag/store";
import { getTemplate, SKILL_LABELS } from "@/lib/templates";
import type { Bot, SkillKey } from "@/lib/types";
import type { AccessState, UsageMonth } from "@/lib/usage";

type Tab = "overview" | "whatsapp" | "plan";

const LANGUAGES: Record<Bot["language"], string> = {
  auto: "Same as the customer",
  english: "English",
  urdu: "Urdu",
  "roman-urdu": "Roman Urdu",
};

interface Props {
  /** Without instructions or knowledge: those are private to the company. */
  bot: Bot;
  company: { id: string; name: string; botCount: number };
  access: AccessState;
  documents: DocumentCounts;
  botReplies: number;
  usage: UsageMonth[];
  current: UsageMonth;
  limit: number | null;
  clients: { id: string; name: string }[];
  whatsapp: WhatsAppInfo;
}

/** What the admin sees of a company's bot: a summary, never its knowledge, leads or chats. */
export default function CompanyBotAdminView({ bot, company, access, documents, botReplies, usage, current, limit, clients, whatsapp }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [deleting, setDeleting] = useState(false);
  const template = getTemplate(bot.template);
  const skills = (Object.keys(SKILL_LABELS) as SkillKey[]).filter((k) => bot.skills[k]).map((k) => SKILL_LABELS[k].label);

  async function remove() {
    if (!confirm(`Delete "${bot.businessName}" of ${company.name}? Its knowledge, chats and leads are deleted too. This cannot be undone.`)) return;
    setDeleting(true);
    await fetch(`/api/admin/bots/${bot.id}`, { method: "DELETE" });
    router.push(`/dashboard/companies/${company.id}`);
    router.refresh();
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "whatsapp", label: "WhatsApp" },
    { key: "plan", label: "Plan & usage" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href={`/dashboard/companies/${company.id}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {company.name}
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${bot.color}22`, color: bot.color }}>
            <TemplateIcon icon={template.icon} className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-2xl font-semibold">{bot.businessName}</h1>
            <p className="text-sm text-slate-500">
              {template.label} bot of{" "}
              <Link href={`/dashboard/companies/${company.id}`} className="text-indigo-700 hover:underline">
                {company.name}
              </Link>
            </p>
          </div>
          {access !== "active" && <AccessBadge access={access} trialEndsAt={bot.trialEndsAt} />}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-6">
          <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
            This bot belongs to {company.name}. Its knowledge, leads and chats are private to the company, so only a summary is shown here.
          </p>

          <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <FileText className="h-4 w-4" aria-hidden />
                Documents
              </div>
              <div className="mt-1 text-2xl font-semibold">{formatNumber(documents.documents)}</div>
              <div className="mt-1 text-xs text-slate-500">
                {documents.files} {documents.files === 1 ? "file" : "files"} · {documents.texts} {documents.texts === 1 ? "text" : "texts"} ·{" "}
                {documents.websitePages} website {documents.websitePages === 1 ? "page" : "pages"}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="text-sm text-slate-500">Replies this month</div>
              <div className="mt-1 text-2xl font-semibold">{formatNumber(botReplies)}</div>
              <div className="mt-1 text-xs text-slate-500">
                Company total {formatNumber(current.messages)}
                {limit === null ? "" : ` of ${formatNumber(limit)}`}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <MessageCircle className="h-4 w-4" aria-hidden />
                WhatsApp
              </div>
              <div className="mt-1 text-2xl font-semibold">{whatsapp.account?.enabled ? "Connected" : "Off"}</div>
              <div className="mt-1 text-xs text-slate-500">{whatsapp.planAllows ? "Included in plan" : `Not in the ${whatsapp.planLabel} plan`}</div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                <CalendarDays className="h-4 w-4" aria-hidden />
                Created
              </div>
              <div className="mt-1 text-2xl font-semibold">{formatDay(bot.createdAt)}</div>
              <div className="mt-1 text-xs text-slate-500">Last changed {formatDay(bot.updatedAt)}</div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold">Details</h2>
            <dl className="grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
              {[
                { label: "Assistant name", value: bot.name },
                { label: "Business type", value: template.label },
                { label: "Plan", value: `${getPlan(bot.plan).label} (company plan)` },
                { label: "Reply language", value: LANGUAGES[bot.language] },
                { label: "Skills turned on", value: skills.length ? skills.join(", ") : "None" },
                { label: "Status", value: bot.status === "paused" ? "Paused" : "Active" },
              ].map((row) => (
                <div key={row.label}>
                  <dt className="text-slate-500">{row.label}</dt>
                  <dd className="font-medium text-slate-900">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white p-5">
            <div>
              <h2 className="font-semibold text-red-700">Delete bot</h2>
              <p className="text-sm text-slate-500">Deletes the bot with its knowledge, chats and leads.</p>
            </div>
            <button
              onClick={remove}
              disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-300 px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete bot
            </button>
          </section>
        </div>
      )}

      {tab === "whatsapp" && <WhatsAppPanel botId={bot.id} isAdmin info={whatsapp} />}

      {tab === "plan" && (
        <PlanUsagePanel
          bot={bot}
          isAdmin
          usage={usage}
          current={current}
          botReplies={botReplies}
          limit={limit}
          access={access}
          company={company}
          clients={clients}
        />
      )}
    </div>
  );
}
