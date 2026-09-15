"use client";

import { CircleCheck, FileText, Globe, Lock, NotebookPen, Search, Trash2, TriangleAlert, Upload, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/lib/format";
import type { KnowledgeSource, SearchHit } from "@/lib/rag/types";

interface Props {
  botId: string;
  initialSources: KnowledgeSource[];
  smartSearch: boolean;
  /** Plan limit on documents/websites per bot; null = unlimited. */
  maxSources: number | null;
  planLabel: string;
  onChange?: () => void;
}

const ICONS: Record<KnowledgeSource["type"], LucideIcon> = { file: FileText, website: Globe, text: NotebookPen };

function SourceIcon({ type }: { type: KnowledgeSource["type"] }) {
  const Icon = ICONS[type];
  return <Icon className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" aria-hidden />;
}
const ACCEPT = ".pdf,.docx,.txt,.md,.csv";

export default function KnowledgeManager({ botId, initialSources, smartSearch, maxSources, planLabel, onChange }: Props) {
  const base = `/api/admin/bots/${botId}`;
  const [sources, setSources] = useState(initialSources);
  const [busy, setBusy] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ type: "ok" | "error"; text: string }[]>([]);
  const [dragging, setDragging] = useState(false);
  const [url, setUrl] = useState("");
  const [maxPages, setMaxPages] = useState(15);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchHit[] | null>(null);

  async function reload() {
    const res = await fetch(`${base}/sources`);
    if (res.ok) setSources((await res.json()).sources);
    onChange?.();
  }

  async function run(label: string, task: () => Promise<{ type: "ok" | "error"; text: string }[]>) {
    setBusy(label);
    setMessages([]);
    try {
      setMessages(await task());
    } catch {
      setMessages([{ type: "error", text: "Connection problem. Please try again." }]);
    }
    setBusy(null);
    await reload();
  }

  function uploadFiles(files: File[]) {
    if (!files.length) return;
    run(`Reading ${files.length === 1 ? files[0].name : `${files.length} files`}...`, async () => {
      const out: { type: "ok" | "error"; text: string }[] = [];
      for (const file of files) {
        setBusy(`Reading ${file.name}...`);
        const form = new FormData();
        form.append("file", file);
        const res = await fetch(`${base}/sources`, { method: "POST", body: form });
        const data = await res.json().catch(() => ({}));
        out.push(
          res.ok
            ? { type: "ok", text: `${file.name}: added ${data.source.chunkCount} sections` }
            : { type: "error", text: `${file.name}: ${data.error ?? "failed"}` },
        );
      }
      return out;
    });
  }

  function importWebsite(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    run(`Reading up to ${maxPages} pages of ${url}... this can take a minute`, async () => {
      const res = await fetch(`${base}/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "website", url: url.trim(), maxPages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return [{ type: "error", text: data.error ?? "Could not read the website" }];
      setUrl("");
      return [{ type: "ok", text: `${data.source.name}: read ${data.source.pages} pages, added ${data.source.chunkCount} sections` }];
    });
  }

  function remove(source: KnowledgeSource) {
    if (!confirm(`Remove "${source.name}" from the bot's knowledge?`)) return;
    run(`Removing ${source.name}...`, async () => {
      const res = await fetch(`${base}/sources/${source.id}`, { method: "DELETE" });
      return res.ok ? [] : [{ type: "error", text: "Could not remove it" }];
    });
  }

  function reindex() {
    run("Preparing smart search...", async () => {
      const res = await fetch(`${base}/sources/reindex`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      return res.ok
        ? [{ type: "ok", text: `Smart search ready (${data.embedded} sections updated)` }]
        : [{ type: "error", text: data.error ?? "Failed" }];
    });
  }

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`${base}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    const data = await res.json().catch(() => ({}));
    setResults(res.ok ? data.results : []);
  }

  const totalChunks = sources.reduce((n, s) => n + s.chunkCount, 0);
  const needsReindex = smartSearch && sources.some((s) => !s.embedded);
  const atLimit = maxSources !== null && sources.length >= maxSources;

  return (
    <div className="space-y-6">
      <div
        className={`rounded-xl border p-4 text-sm ${
          smartSearch ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-slate-200 bg-white text-slate-600"
        }`}
      >
        {smartSearch ? (
          <>
            <b>Smart search is on.</b> The bot finds information by meaning and keywords, so a question in Roman Urdu can
            match an English document.
          </>
        ) : (
          <>
            <b>Keyword search.</b> The bot finds information by matching words. Add a free <code>GEMINI_API_KEY</code> to
            turn on smart search, which understands meaning across languages.
          </>
        )}
        {needsReindex && (
          <button onClick={reindex} disabled={!!busy} className="ml-3 rounded-md bg-emerald-600 px-3 py-1 text-white disabled:opacity-50">
            Re-index for smart search
          </button>
        )}
      </div>

      {atLimit && (
        <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-100 p-4 text-sm text-slate-700">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Adding more is locked: the {planLabel} plan allows {maxSources} documents or websites per bot. Remove one below, or upgrade the plan.
          </span>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <section
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (!atLimit) uploadFiles([...e.dataTransfer.files]);
          }}
          className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-white p-6 text-center ${
            dragging ? "border-indigo-500 bg-indigo-50" : "border-slate-300"
          }`}
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Upload className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-2 font-semibold">Upload documents</h3>
          <p className="mt-1 text-sm text-slate-500">PDF, Word (.docx), TXT, CSV. Drag files here or choose them. Max 15 MB each.</p>
          <label
            className={`mt-4 flex cursor-pointer items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 ${
              busy || atLimit ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {atLimit && <Lock className="h-4 w-4" aria-hidden />}
            Choose files
            <input
              type="file"
              multiple
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                uploadFiles([...(e.target.files ?? [])]);
                e.target.value = "";
              }}
            />
          </label>
        </section>

        <form onSubmit={importWebsite} className="flex flex-col rounded-xl border border-slate-200 bg-white p-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Globe className="h-5 w-5" aria-hidden />
          </span>
          <h3 className="mt-2 font-semibold">Import a website</h3>
          <p className="mt-1 text-sm text-slate-500">Reads the pages of the business website: services, prices, FAQs, contact.</p>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="www.example.com"
            className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <div className="mt-3 flex items-center gap-3">
            <select
              value={maxPages}
              onChange={(e) => setMaxPages(Number(e.target.value))}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
            >
              {[5, 15, 30, 50].map((n) => (
                <option key={n} value={n}>
                  Up to {n} pages
                </option>
              ))}
            </select>
            <button
              disabled={!!busy || !url.trim() || atLimit}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {atLimit && <Lock className="h-4 w-4" aria-hidden />}
              Import
            </button>
          </div>
        </form>
      </div>

      {busy && (
        <div className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          {busy}
        </div>
      )}
      {messages.map((m, i) => (
        <div
          key={i}
          className={`flex items-start gap-2 rounded-lg p-3 text-sm ${m.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}
        >
          {m.type === "ok" ? (
            <CircleCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          ) : (
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          )}
          {m.text}
        </div>
      ))}

      <section className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h3 className="font-semibold">Knowledge sources</h3>
          <span className="text-sm text-slate-500">
            {sources.length}
            {maxSources !== null ? ` of ${maxSources}` : ""} sources · {totalChunks} sections
          </span>
        </div>
        {sources.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-500">
            Nothing imported yet. The bot currently uses only the business information on the Setup tab.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {sources.map((s) => (
              <li key={s.id} className="flex items-start gap-3 px-5 py-3">
                <SourceIcon type={s.type} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {s.url ? (
                      <a href={s.url} target="_blank" rel="noreferrer" className="truncate font-medium hover:underline">
                        {s.name}
                      </a>
                    ) : (
                      <span className="truncate font-medium">{s.name}</span>
                    )}
                    {smartSearch && (
                      <span className={`rounded px-1.5 text-xs ${s.embedded ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {s.embedded ? "smart search" : "keywords only"}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500">
                    {s.pages ? `${s.pages} pages · ` : ""}
                    {s.chunkCount} sections · {s.chars.toLocaleString()} characters · added {formatDate(s.createdAt)}
                  </div>
                  {s.warning && (
                    <div className="mt-1 flex items-start gap-1.5 text-xs text-amber-700">
                      <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
                      {s.warning}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => remove(s)}
                  disabled={!!busy}
                  className="flex items-center gap-1 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div>
          <h3 className="font-semibold">Test search</h3>
          <p className="text-sm text-slate-500">Type a customer question to see which information the bot will read before answering.</p>
        </div>
        <form onSubmit={search} className="flex gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            dir="auto"
            placeholder="e.g. delivery charges kitne hain?"
            className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500"
          />
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50">
            <Search className="h-4 w-4" aria-hidden />
            Search
          </button>
        </form>
        {results && results.length === 0 && <p className="text-sm text-slate-500">No matching information found.</p>}
        {results?.map((r, i) => (
          <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
            <div className="mb-1 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">#{i + 1}</span>
              <span>{r.heading ?? r.sourceName}</span>
              <span className="rounded bg-white px-1.5">found by {r.via}</span>
            </div>
            <p className="line-clamp-4 whitespace-pre-wrap text-sm text-slate-700" dir="auto">
              {r.text}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
