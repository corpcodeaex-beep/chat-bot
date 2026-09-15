import { ArrowRight, Check, CircleX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BlobField, BlobShape, WaveDivider } from "@/components/marketing/Backgrounds";
import ChatDemo from "@/components/marketing/ChatDemo";
import CtaBanner from "@/components/marketing/CtaBanner";
import Faq from "@/components/marketing/Faq";
import { DrawLine, Magnetic, ParallaxLayer, ParallaxScene, Reveal, Stagger, StaggerItem, TextReveal, Tilt } from "@/components/marketing/motion";
import PricingCards from "@/components/marketing/PricingCards";
import SectionHeading from "@/components/marketing/SectionHeading";
import TemplateIcon from "@/components/TemplateIcon";
import { FAQS, getIndustry, INDUSTRIES, STEPS } from "@/lib/marketing";

export function generateStaticParams() {
  return INDUSTRIES.map((industry) => ({ slug: industry.slug }));
}

export async function generateMetadata({ params }: PageProps<"/industries/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) return {};
  return { title: `AI chat assistant for ${industry.name.toLowerCase()}`, description: industry.subheadline };
}

export default async function IndustryPage({ params }: PageProps<"/industries/[slug]">) {
  const { slug } = await params;
  const industry = getIndustry(slug);
  if (!industry) notFound();
  const others = INDUSTRIES.filter((i) => i.slug !== industry.slug);

  return (
    <>
      <ParallaxScene className="relative overflow-hidden">
        <BlobField variant="hero" />
        <div className="mk-grid absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 80% 65% at 50% 0%, black, transparent)" }} aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div>
            <Reveal y={12}>
              <span
                className="inline-flex items-center gap-2 rounded-full border bg-white/85 px-3 py-1.5 text-sm font-medium shadow-sm backdrop-blur"
                style={{ borderColor: `${industry.color}55`, color: industry.color }}
              >
                <TemplateIcon icon={industry.icon} className="h-4 w-4" />
                For {industry.name.toLowerCase()}
              </span>
            </Reveal>
            <h1 className="mt-6 text-4xl font-semibold leading-[1.08] tracking-tight text-mk-text sm:text-6xl">
              <TextReveal text={industry.headline} />
            </h1>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-mk-muted">{industry.subheadline}</p>
            </Reveal>
            <Reveal delay={0.45}>
              <div className="mt-9 flex flex-wrap gap-3">
                <Magnetic>
                  <Link
                    href={`/contact?industry=${industry.slug}`}
                    className="group inline-flex items-center gap-2 rounded-full bg-mk-primary px-7 py-3.5 font-semibold text-white shadow-xl shadow-mk-primary/30 transition hover:bg-mk-primary-dark"
                  >
                    Book a free demo
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white/85 px-7 py-3.5 font-semibold text-mk-text transition hover:border-mk-primary/40"
                  >
                    See pricing
                  </Link>
                </Magnetic>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2} y={40} className="relative mx-auto w-full max-w-sm lg:mr-0">
            <ParallaxLayer depth={-18} className="absolute -inset-16">
              <BlobShape className="h-full w-full opacity-60" color={industry.color} />
            </ParallaxLayer>
            <ParallaxLayer depth={16} className="relative">
              <Tilt max={6} scale={1}>
                <div className="mk-float">
                  <ChatDemo title={industry.business} color={industry.color} messages={industry.chat} />
                </div>
              </Tilt>
              <div className="mx-auto mt-6 h-6 w-3/4 rounded-[100%] bg-slate-900/15 blur-xl" aria-hidden />
              <p className="mt-1 text-center text-xs text-mk-muted">Example conversation</p>
            </ParallaxLayer>
          </Reveal>
        </div>
        <WaveDivider fill="#f7f5f0" />
      </ParallaxScene>

      <section className="relative overflow-hidden bg-mk-background py-24">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Before and after" title={`What changes for ${industry.name.toLowerCase()}`} />
          </Reveal>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-2" gap={0.15}>
            <StaggerItem>
              <Tilt max={5} className="h-full">
                <div className="h-full rounded-3xl border border-white bg-white/85 p-8 shadow-lg shadow-slate-900/5 backdrop-blur">
                  <h3 className="text-lg font-semibold text-mk-text">Today</h3>
                  <ul className="mt-5 space-y-4">
                    {industry.pains.map((pain) => (
                      <li key={pain} className="flex items-start gap-3 text-mk-muted">
                        <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" aria-hidden />
                        {pain}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </StaggerItem>
            <StaggerItem>
              <Tilt max={5} className="h-full">
                <div
                  className="relative h-full overflow-hidden rounded-3xl p-8 text-white shadow-2xl shadow-mk-primary/25"
                  style={{ background: `linear-gradient(135deg, ${industry.color}, #1e2a3a)` }}
                >
                  <BlobShape className="mk-float-slow absolute -right-16 -top-16 h-56 w-56 opacity-25" color="#ffffff" />
                  <h3 className="relative text-lg font-semibold">With your AI assistant</h3>
                  <ul className="relative mt-5 space-y-4">
                    {industry.wins.map((win) => (
                      <li key={win} className="flex items-start gap-3">
                        <Check className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
                        {win}
                      </li>
                    ))}
                  </ul>
                </div>
              </Tilt>
            </StaggerItem>
          </Stagger>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Live in three simple steps" />
          </Reveal>
          <div className="relative mt-14">
            <DrawLine className="absolute left-[16%] right-[16%] top-12 hidden h-0.5 rounded-full md:block" />
            <Stagger className="relative grid gap-6 md:grid-cols-3" gap={0.18}>
              {STEPS.map((step, i) => (
                <StaggerItem key={step.title}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-full font-semibold text-white shadow-lg"
                      style={{ background: industry.color, boxShadow: `0 10px 25px -8px ${industry.color}` }}
                    >
                      {i + 1}
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-mk-text">{step.title}</h3>
                    <p className="mt-2 leading-7 text-mk-muted">{step.text}</p>
                  </div>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mk-background py-24">
        <BlobField variant="soft" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Pricing" title="Pick the plan that fits" />
          </Reveal>
          <div className="mt-14">
            <PricingCards />
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <Faq items={FAQS.slice(0, 5)} />
          </Reveal>
          <Reveal className="mx-auto mt-16 max-w-4xl text-center">
            <p className="text-sm font-medium text-mk-muted">Also made for</p>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  href={`/industries/${other.slug}`}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-mk-text shadow-sm transition hover:-translate-y-0.5 hover:border-mk-secondary hover:shadow-md"
                >
                  <span style={{ color: other.color }}>
                    <TemplateIcon icon={other.icon} className="h-4 w-4" />
                  </span>
                  {other.name}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
        <CtaBanner title={`Ready to try it for your ${industry.name.toLowerCase().replace(/ &.*$/, "")}?`} />
      </section>
    </>
  );
}
