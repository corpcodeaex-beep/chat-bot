import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import CtaBanner from "@/components/marketing/CtaBanner";
import { Stagger, StaggerItem, Tilt } from "@/components/marketing/motion";
import PageHero from "@/components/marketing/PageHero";
import TemplateIcon from "@/components/TemplateIcon";
import { INDUSTRIES } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Industries",
  description: "AI chat assistants for clinics, real estate, restaurants, schools, online stores and salons.",
};

export default function IndustriesPage() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        title="An assistant made for your kind of business"
        highlight={["your", "kind"]}
        text="Each one starts with the right questions, instructions and lead capture for your industry, then learns your own details."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-6 pt-4 sm:px-6">
          <Stagger className="grid gap-6 md:grid-cols-2" gap={0.08}>
            {INDUSTRIES.map((industry) => (
              <StaggerItem key={industry.slug}>
                <Tilt max={6} className="h-full">
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="group grid h-full gap-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-mk-secondary hover:shadow-2xl hover:shadow-slate-900/10 sm:grid-cols-[1fr_1.1fr]"
                  >
                    <div className="flex flex-col">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110"
                        style={{ background: `${industry.color}18`, color: industry.color }}
                      >
                        <TemplateIcon icon={industry.icon} className="h-6 w-6" />
                      </span>
                      <h2 className="mt-5 text-xl font-semibold text-mk-text">{industry.name}</h2>
                      <p className="mt-2 flex-1 leading-7 text-mk-muted">{industry.headline}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mk-primary">
                        See how it works
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                      </span>
                    </div>
                    <div className="space-y-2 rounded-2xl bg-mk-background p-4 text-sm" aria-hidden>
                      {industry.chat.slice(0, 2).map((m, i) => (
                        <p
                          key={i}
                          className={`w-fit max-w-[90%] rounded-2xl px-3 py-2 leading-relaxed ${
                            m.from === "customer" ? "ml-auto rounded-br-md text-white" : "rounded-bl-md bg-white text-mk-text shadow-sm"
                          }`}
                          style={m.from === "customer" ? { background: industry.color } : undefined}
                        >
                          {m.text.replace(/\*\*/g, "")}
                        </p>
                      ))}
                    </div>
                  </Link>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <CtaBanner title="Don't see your industry?" text="The assistant works for any business that answers customer questions. Tell us about yours." />
      </section>
    </>
  );
}
