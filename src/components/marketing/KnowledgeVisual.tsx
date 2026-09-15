import { ArrowRight, Bot, FileText, Globe, NotebookPen } from "lucide-react";

const SOURCES = [
  { icon: FileText, name: "price-list-2026.pdf", note: "PDF" },
  { icon: FileText, name: "services-brochure.docx", note: "Word" },
  { icon: Globe, name: "yourbusiness.com", note: "Website pages" },
  { icon: NotebookPen, name: "Timings & delivery notes", note: "Quick notes" },
];

export default function KnowledgeVisual() {
  return (
    <div className="grid items-center gap-5 md:grid-cols-[1fr_auto_1fr]" aria-hidden>
      <ul className="space-y-3">
        {SOURCES.map((s) => (
          <li key={s.name} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-50 text-slate-600">
              <s.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{s.name}</p>
              <p className="text-xs text-slate-500">{s.note}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex justify-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-linear-to-br from-mk-primary to-[#34465e] text-white shadow-lg shadow-slate-500/30">
          <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
        </span>
      </div>
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-900/10">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-slate-900">Your assistant</p>
            <p className="text-xs text-slate-500">Answers only from your information</p>
          </div>
        </div>
        <div className="mt-4 space-y-2 text-sm">
          <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-slate-600 px-3 py-2 text-white">Teeth whitening kitne ki hai?</p>
          <p className="w-fit rounded-2xl rounded-bl-md bg-slate-100 px-3 py-2 text-slate-800">
            Teeth whitening is <b>Rs. 25,000</b>, from your price list. Want to book?
          </p>
        </div>
      </div>
    </div>
  );
}
