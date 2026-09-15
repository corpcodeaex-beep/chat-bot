"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Copy, Download, ExternalLink, FileUp, Lock, MessageCircle, Trash2 } from "lucide-react";
import AccessBadge from "./AccessBadge";
import ChatWindow from "./ChatWindow";
import KnowledgeManager from "./KnowledgeManager";
import PlanUsagePanel from "./PlanUsagePanel";
import RichText from "./RichText";
import WhatsAppPanel, { type WhatsAppInfo } from "./WhatsAppPanel";
import { formatDate, whatsappLink } from "@/lib/format";
import { getPlan } from "@/lib/plans";
import type { KnowledgeSource } from "@/lib/rag/types";
import type { AccessState, UsageMonth } from "@/lib/usage";
import { SKILL_LABELS } from "@/lib/templates";
import type { Bot, Conversation, LanguageMode, Lead, SkillKey } from "@/lib/types";

type Tab = "setup" | "knowledge" | "test" | "leads" | "chats" | "whatsapp" | "plan" | "install";

interface Props {
  bot: Bot;
  isAdmin: boolean;
  leads: Lead[];
  conversations: Conversation[];
  sources: KnowledgeSource[];
  smartSearch: boolean;
  appUrl: string;
  usage: UsageMonth[];
  currentUsage: UsageMonth;
  botReplies: number;
  limit: number | null;
  access: AccessState;
  company: { id: string; name: string; botCount: number } | null;
  clients: { id: string; name: string }[];
  whatsapp: WhatsAppInfo;
}

const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500";

export default function BotWorkspace({
  bot,
  isAdmin,
  leads,
  conversations,
  sources,
  smartSearch,
  appUrl,
  usage,
  currentUsage,
  botReplies,
  limit,
  access,
  company,
  clients,
  whatsapp,
}: Props) {
  const plan = getPlan(bot.plan);
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("setup");
  const [chatKey, setChatKey] = useState(0);
  const [setupDirty, setSetupDirty] = useState(false);

  const tabs: { key: Tab; label: string; locked?: boolean }[] = [
    { key: "setup", label: setupDirty ? "Setup (unsaved)" : "Setup" },
    { key: "knowledge", label: `Knowledge (${sources.length})` },
    { key: "test", label: "Test chat" },
    { key: "leads", label: `Leads (${leads.length})` },
    { key: "chats", label: `Chats (${conversations.length})` },
    { key: "whatsapp", label: "WhatsApp", locked: !whatsapp.planAllows },
    { key: "plan", label: "Plan & usage" },
    { key: "install", label: "Install on website" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Link href={isAdmin ? "/dashboard/bots" : "/dashboard"} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:underline">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          {isAdmin ? "All bots" : "My assistants"}
        </Link>
        <div className="flex w-full flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{bot.businessName}</h1>
          {access !== "active" && <AccessBadge access={access} trialEndsAt={bot.trialEndsAt} />}
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium ${
              tab === t.key ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.label}
            {t.locked && <Lock className="h-3.5 w-3.5 text-slate-400" aria-label="Not included in plan" />}
          </button>
        ))}
      </div>

      {/* Kept mounted while other tabs are open so unsaved edits are not lost. */}
      <div hidden={tab !== "setup"}>
        <SetupForm bot={bot} canDelete onSaved={() => router.refresh()} onDirtyChange={setSetupDirty} />
      </div>

      {tab === "knowledge" && (
        <KnowledgeManager
          botId={bot.id}
          initialSources={sources}
          smartSearch={smartSearch}
          maxSources={plan.maxSources}
          planLabel={plan.label}
          onChange={() => router.refresh()}
        />
      )}

      {tab === "test" && (
        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <div className="h-[600px] overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
            <ChatWindow
              key={chatKey}
              botId={bot.id}
              businessName={bot.businessName}
              color={bot.color}
              welcome={bot.welcome}
              showNotices
              pageUrl="dashboard-test"
              onReply={() => router.refresh()}
            />
          </div>
          <div className="space-y-3 text-sm text-slate-600">
            <p className="font-medium text-slate-800">Try these to test the bot:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Ask about prices, timings or a service</li>
              <li>Write in Roman Urdu, e.g. &quot;fees kitni hai?&quot;</li>
              <li>Say you want to book or order, then give a name and phone number</li>
              <li>Ask to talk to a real person</li>
            </ul>
            <p>Test chats also appear in the Chats tab and any lead appears in Leads.</p>
            <button onClick={() => setChatKey((k) => k + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-50">
              Reset test chat
            </button>
          </div>
        </div>
      )}

      {tab === "leads" && <LeadsTable bot={bot} leads={leads} />}
      {tab === "chats" && <ChatsView conversations={conversations} leads={leads} />}
      {tab === "whatsapp" && <WhatsAppPanel botId={bot.id} isAdmin={isAdmin} info={whatsapp} />}
      {tab === "plan" && (
        <PlanUsagePanel
          bot={bot}
          isAdmin={isAdmin}
          usage={usage}
          current={currentUsage}
          botReplies={botReplies}
          limit={limit}
          access={access}
          company={company}
          clients={clients}
        />
      )}
      {tab === "install" && <InstallView bot={bot} appUrl={appUrl} />}
    </div>
  );
}

function SetupForm({
  bot,
  canDelete,
  onSaved,
  onDirtyChange,
}: {
  bot: Bot;
  canDelete: boolean;
  onSaved: () => void;
  onDirtyChange: (dirty: boolean) => void;
}) {
  const router = useRouter();
  const [savedForm, setSavedForm] = useState(() => ({
    name: bot.name,
    businessName: bot.businessName,
    color: bot.color,
    welcome: bot.welcome,
    language: bot.language,
    instructions: bot.instructions,
    knowledge: bot.knowledge,
    skills: bot.skills,
  }));
  const [form, setForm] = useState(savedForm);
  const [status, setStatus] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const dirty = JSON.stringify(form) !== JSON.stringify(savedForm);

  // Warn before closing or reloading the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    setStatus(null);
    onDirtyChange(JSON.stringify(next) !== JSON.stringify(savedForm));
  };

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/bots/${bot.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setStatus({ type: "ok", text: "Saved" });
      setSavedForm(form);
      onDirtyChange(false);
      onSaved();
    } else {
      setStatus({ type: "error", text: data.error ?? "Could not save" });
    }
  }

  async function remove() {
    if (!confirm(`Delete "${bot.businessName}" with all its chats and leads? This cannot be undone.`)) return;
    await fetch(`/api/admin/bots/${bot.id}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  }

  async function importFile(file: File) {
    const text = await file.text();
    set("knowledge", `${form.knowledge.trim()}\n\n${text.trim()}`.trim());
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Basics</h2>
        <Field label="Business name">
          <input className={inputClass} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
        </Field>
        <Field label="Internal bot name" hint="Only you see this.">
          <input className={inputClass} value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Welcome message">
          <textarea className={inputClass} rows={2} value={form.welcome} onChange={(e) => set("welcome", e.target.value)} dir="auto" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Brand color">
            <div className="flex items-center gap-2">
              <input type="color" value={form.color} onChange={(e) => set("color", e.target.value)} className="h-9 w-12 cursor-pointer rounded border border-slate-300" />
              <input className={inputClass} value={form.color} onChange={(e) => set("color", e.target.value)} />
            </div>
          </Field>
          <Field label="Reply language">
            <select className={inputClass} value={form.language} onChange={(e) => set("language", e.target.value as LanguageMode)}>
              <option value="auto">Same as customer</option>
              <option value="english">English</option>
              <option value="urdu">Urdu</option>
              <option value="roman-urdu">Roman Urdu</option>
            </select>
          </Field>
        </div>

        <h2 className="pt-2 font-semibold">Skills</h2>
        <div className="space-y-2">
          {(Object.keys(SKILL_LABELS) as SkillKey[]).map((key) => (
            <label key={key} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.skills[key]}
                onChange={(e) => set("skills", { ...form.skills, [key]: e.target.checked })}
              />
              <span>
                <span className="block text-sm font-medium">{SKILL_LABELS[key].label}</span>
                <span className="block text-xs text-slate-500">{SKILL_LABELS[key].help}</span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">Brain</h2>
        <Field label="Instructions" hint="How the bot should behave: its role, tone, what to collect, what to avoid.">
          <textarea className={inputClass} rows={6} value={form.instructions} onChange={(e) => set("instructions", e.target.value)} dir="auto" />
        </Field>
        <Field
          label="Quick business notes"
          hint="Short key facts: services, prices, timings, location. Separate topics with a blank line. For PDFs, Word files and websites, use the Knowledge tab."
        >
          <textarea
            className={`${inputClass} font-mono`}
            rows={16}
            value={form.knowledge}
            onChange={(e) => set("knowledge", e.target.value)}
            dir="auto"
            placeholder={"Example:\nTimings: Monday to Saturday, 10am to 8pm\n\nWhatsApp: 03xx-xxxxxxx\n\nDelivery: free above Rs. 2,000 in Lahore"}
          />
        </Field>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
          <FileUp className="h-4 w-4" aria-hidden />
          Add from a text file (.txt, .md, .csv)
          <input
            type="file"
            accept=".txt,.md,.csv,text/plain,text/markdown,text/csv"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importFile(file);
              e.target.value = "";
            }}
          />
        </label>
        <p className="text-xs text-slate-500">{form.knowledge.length.toLocaleString()} characters</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 lg:col-span-2">
        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
        {dirty && !status && <span className="text-sm font-medium text-amber-700">Unsaved changes</span>}
        {status && (
          <span className={`flex items-center gap-1 text-sm ${status.type === "ok" ? "text-emerald-700" : "text-red-600"}`}>
            {status.type === "ok" && <Check className="h-4 w-4" aria-hidden />}
            {status.text}
          </span>
        )}
        {canDelete && (
          <button onClick={remove} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <Trash2 className="h-4 w-4" aria-hidden />
            Delete bot
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-sm font-medium">{label}</div>
      {children}
      {hint && <div className="text-xs text-slate-500">{hint}</div>}
    </div>
  );
}

function LeadsTable({ bot, leads }: { bot: Bot; leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        No leads yet. When a customer shares their contact details in the chat, they appear here.
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <a
        href={`/api/admin/bots/${bot.id}/leads`}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
      >
        <Download className="h-4 w-4" aria-hidden />
        Download CSV (Excel)
      </a>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {["When", "Name", "Phone", "Email", "Wants", "Preferred time"].map((h) => (
                <th key={h} className="px-4 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-slate-100 align-top">
                <td className="whitespace-nowrap px-4 py-2 text-slate-500">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-2">{lead.name ?? "-"}</td>
                <td className="whitespace-nowrap px-4 py-2">
                  {lead.phone ? (
                    <a href={whatsappLink(lead.phone)} target="_blank" rel="noreferrer" className="text-emerald-700 hover:underline" title="Open in WhatsApp">
                      {lead.phone}
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="px-4 py-2">{lead.email ?? "-"}</td>
                <td className="px-4 py-2 text-slate-600" dir="auto">
                  {lead.need ?? "-"}
                </td>
                <td className="px-4 py-2">{lead.time ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ChatsView({ conversations, leads }: { conversations: Conversation[]; leads: Lead[] }) {
  const [selectedId, setSelectedId] = useState(conversations[0]?.id);
  const selected = conversations.find((c) => c.id === selectedId);

  if (conversations.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">
        No conversations yet. Try the Test chat tab.
      </div>
    );
  }
  const leadFor = (id: string) => leads.find((l) => l.conversationId === id);
  const selectedLead = selected && leadFor(selected.id);

  return (
    <div className="grid gap-4 md:grid-cols-[300px_1fr]">
      <div className="max-h-[600px] space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2">
        {conversations.map((c) => {
          const firstUser = c.messages.find((m) => m.role === "user")?.content ?? "";
          return (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={`w-full rounded-lg p-3 text-left ${c.id === selectedId ? "bg-indigo-50" : "hover:bg-slate-50"}`}
            >
              <div className="flex items-center gap-2 text-xs text-slate-500">
                {formatDate(c.updatedAt)}
                {c.needsHuman && <span className="rounded bg-red-100 px-1.5 text-red-700">needs human</span>}
                {leadFor(c.id) && <span className="rounded bg-emerald-100 px-1.5 text-emerald-700">lead</span>}
              </div>
              <div className="mt-1 truncate text-sm" dir="auto">
                {firstUser}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
            <span>Started {formatDate(selected.createdAt)}</span>
            {selected.pageUrl && <span className="truncate">From: {selected.pageUrl}</span>}
            {selectedLead?.phone && (
              <a
                href={whatsappLink(selectedLead.phone)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-medium text-emerald-700 hover:underline"
              >
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                WhatsApp {selectedLead.name ?? "customer"}
              </a>
            )}
          </div>
          <div className="max-h-[520px] space-y-2 overflow-y-auto">
            {selected.messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  dir="auto"
                  className={`max-w-[80%] break-words rounded-2xl px-3.5 py-2 text-sm ${
                    m.role === "user" ? "whitespace-pre-wrap bg-indigo-600 text-white" : "bg-slate-100 text-slate-800"
                  }`}
                >
                  {m.role === "assistant" ? <RichText text={m.content} /> : m.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InstallView({ bot, appUrl }: { bot: Bot; appUrl: string }) {
  const snippet = `<script src="${appUrl}/widget.js" data-bot="${bot.id}" async></script>`;
  const directLink = `${appUrl}/embed/${bot.id}`;
  const [copied, setCopied] = useState("");

  const copy = async (text: string, which: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(which);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      {appUrl.includes("localhost") && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          This address is <b>localhost</b>, so it only works on this computer. Deploy the app (for example free on Vercel)
          before adding the code to a client&apos;s website.
        </div>
      )}
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">1. Website chat bubble</h2>
        <p className="text-sm text-slate-600">
          Paste this just before <code>&lt;/body&gt;</code> on the website. It works with WordPress (use a
          &quot;header and footer scripts&quot; plugin), Shopify, Wix, Webflow and plain HTML.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">{snippet}</pre>
        <button
          onClick={() => copy(snippet, "snippet")}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700"
        >
          {copied === "snippet" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          {copied === "snippet" ? "Copied" : "Copy code"}
        </button>
      </section>
      <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-semibold">2. Direct chat link</h2>
        <p className="text-sm text-slate-600">
          For businesses without a website: put this link in the Instagram bio, Facebook page, Google Business profile or
          WhatsApp status. It is also the easiest way to send a demo to a prospect.
        </p>
        <pre className="overflow-x-auto rounded-lg bg-slate-100 p-3 text-sm">{directLink}</pre>
        <div className="flex gap-2">
          <button
            onClick={() => copy(directLink, "link")}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            {copied === "link" ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
            {copied === "link" ? "Copied" : "Copy link"}
          </button>
          <a
            href={directLink}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" aria-hidden />
            Open
          </a>
        </div>
      </section>
    </div>
  );
}
