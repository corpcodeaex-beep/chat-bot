"use client";

import { Lock, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import TemplateIcon from "@/components/TemplateIcon";

interface TemplateSummary {
  key: string;
  label: string;
  icon: string;
  color: string;
  description: string;
  businessName: string;
}

interface Props {
  templates: TemplateSummary[];
  /** Company users: prefilled with their company name. */
  defaultBusinessName?: string;
  /** Company users: how many bots they have and may have. */
  capacity?: { used: number; max: number | null; planLabel: string };
}

export default function NewBotForm({ templates, defaultBusinessName, capacity }: Props) {
  const router = useRouter();
  const [template, setTemplate] = useState(templates[0].key);
  const [businessName, setBusinessName] = useState(defaultBusinessName ?? "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selected = templates.find((t) => t.key === template)!;
  const isCompany = !!capacity;
  const locked = !!capacity && capacity.max !== null && capacity.used >= capacity.max;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/admin/bots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template, businessName: businessName.trim() || undefined }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not create the assistant");
      setSaving(false);
      return;
    }
    router.push(`/dashboard/bots/${data.bot.id}`);
    router.refresh();
  }

  if (locked) {
    return (
      <section className="mx-auto flex max-w-lg flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white p-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Lock className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="text-lg font-semibold">You have reached your plan&apos;s assistant limit</h1>
        <p className="text-sm text-slate-600">
          The {capacity.planLabel} plan includes {capacity.max} {capacity.max === 1 ? "assistant" : "assistants"}, and you are using{" "}
          {capacity.used}. Contact your provider to upgrade, or delete an assistant you no longer need.
        </p>
        <Link href="/dashboard" className="text-sm text-indigo-700 hover:underline">
          Back to my assistants
        </Link>
      </section>
    );
  }

  return (
    <form onSubmit={create} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{isCompany ? "Create a new assistant" : "Create a new bot"}</h1>
        <p className="mt-1 text-slate-500">
          Pick the type of business. You will get ready-made instructions and sample information to edit.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => (
          <button
            type="button"
            key={t.key}
            onClick={() => setTemplate(t.key)}
            className={`rounded-xl border bg-white p-4 text-left transition ${
              template === t.key ? "border-indigo-500 ring-2 ring-indigo-200" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${t.color}1a`, color: t.color }}>
              <TemplateIcon icon={t.icon} className="h-5 w-5" />
            </span>
            <div className="mt-2 font-semibold">{t.label}</div>
            <div className="mt-1 text-sm text-slate-500">{t.description}</div>
          </button>
        ))}
      </div>

      <div className="max-w-md space-y-2">
        <label className="block text-sm font-medium" htmlFor="businessName">
          Business name
        </label>
        <input
          id="businessName"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder={selected.businessName}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none focus:border-indigo-500"
        />
        {!isCompany && (
          <p className="text-xs text-slate-500">Tip: use your prospect&apos;s real business name to make the demo feel personal.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap items-center gap-4">
        <button
          disabled={saving}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden />
          {saving ? "Creating..." : `Create ${selected.label.toLowerCase()} ${isCompany ? "assistant" : "bot"}`}
        </button>
        {capacity && capacity.max !== null && (
          <span className="text-sm text-slate-500">
            {capacity.used} of {capacity.max} assistants used on your {capacity.planLabel} plan
          </span>
        )}
      </div>
    </form>
  );
}
