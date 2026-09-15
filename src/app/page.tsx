import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import TemplateIcon from "@/components/TemplateIcon";
import { BRAND } from "@/lib/brand";
import { TEMPLATES } from "@/lib/templates";

export default function Home() {
  return (
    <main className="flex-1">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <MessageSquareText className="h-[18px] w-[18px]" aria-hidden />
          </span>
          {BRAND.name}
        </div>
        <Link href="/dashboard" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
          Dashboard
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Never miss a customer again, <span className="text-indigo-600">even at 2am</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          {BRAND.tagline}. Answers in English, Urdu and Roman Urdu, books appointments, takes orders, and sends you every
          lead.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/dashboard/new" className="rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white hover:bg-indigo-700">
            Create an assistant
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24">
        <h2 className="text-center text-2xl font-semibold">Ready for your type of business</h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEMPLATES.map((t) => (
            <div key={t.key} className="rounded-xl border border-slate-200 bg-white p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${t.color}1a`, color: t.color }}>
                <TemplateIcon icon={t.icon} className="h-5 w-5" />
              </span>
              <div className="mt-2 font-semibold">{t.label}</div>
              <div className="mt-1 text-sm text-slate-500">{t.description}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
