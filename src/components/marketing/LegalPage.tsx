import { CalendarDays, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import PageHero from "./PageHero";
import { LEGAL_DOCS, LEGAL_UPDATED, type LegalDoc } from "@/lib/legal";

/** Shared layout for policy pages: hero, key points, sticky contents list and readable sections. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <>
      <PageHero eyebrow="Legal" title={doc.title} text={doc.description}>
        <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-mk-muted shadow-sm ring-1 ring-mk-secondary backdrop-blur">
          <CalendarDays className="h-4 w-4 text-mk-accent" aria-hidden />
          Last updated {LEGAL_UPDATED}
        </p>
      </PageHero>

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 pb-24 pt-6 sm:px-6 lg:grid-cols-[230px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-8 text-sm" aria-label="On this page">
              <div>
                <p className="font-semibold text-mk-text">On this page</p>
                <ul className="mt-3 space-y-2 border-l border-mk-secondary">
                  {doc.sections.map((s) => (
                    <li key={s.id}>
                      <a href={`#${s.id}`} className="-ml-px block border-l border-transparent pl-4 text-mk-muted transition hover:border-mk-accent hover:text-mk-text">
                        {s.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-semibold text-mk-text">Policies</p>
                <ul className="mt-3 space-y-2">
                  {LEGAL_DOCS.map((d) => (
                    <li key={d.path}>
                      <Link
                        href={d.path}
                        aria-current={d.path === doc.path ? "page" : undefined}
                        className={`flex items-center gap-2 ${d.path === doc.path ? "font-medium text-mk-text" : "text-mk-muted hover:text-mk-text"}`}
                      >
                        <FileText className={`h-4 w-4 ${d.path === doc.path ? "text-mk-accent" : "text-slate-400"}`} aria-hidden />
                        {d.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>

          <article className="min-w-0 max-w-3xl">
            <div className="rounded-3xl border border-mk-secondary/70 bg-mk-background p-6 sm:p-8">
              <p className="flex items-center gap-2 font-semibold text-mk-text">
                <ShieldCheck className="h-5 w-5 text-mk-accent" aria-hidden />
                The short version
              </p>
              <ul className="mt-4 space-y-2.5 text-mk-muted">
                {doc.summary.map((point) => (
                  <li key={point} className="flex gap-3 leading-7">
                    <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-mk-accent" aria-hidden />
                    {point}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-12 space-y-12">
              {doc.sections.map((section, i) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="flex items-baseline gap-3 text-2xl font-semibold tracking-tight text-mk-text">
                    <span className="font-mono text-sm font-medium text-mk-accent">{String(i + 1).padStart(2, "0")}</span>
                    {section.title}
                  </h2>
                  <div className="mt-4 space-y-4 leading-8 text-mk-muted">
                    {section.body.map((block, j) =>
                      typeof block === "string" ? (
                        <p key={j}>{block}</p>
                      ) : (
                        <ul key={j} className="space-y-2.5">
                          {block.list.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-[13px] h-1.5 w-1.5 shrink-0 rounded-full bg-mk-primary/40" aria-hidden />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-16 flex flex-wrap gap-2 border-t border-slate-200 pt-8 lg:hidden">
              {LEGAL_DOCS.filter((d) => d.path !== doc.path).map((d) => (
                <Link key={d.path} href={d.path} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-mk-text hover:border-mk-accent">
                  {d.title}
                </Link>
              ))}
            </div>
          </article>
        </div>
      </section>
    </>
  );
}
