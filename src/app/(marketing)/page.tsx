import { ArrowRight, Check, Languages, Sparkles, Target } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { BlobField, BlobShape, WaveDivider } from "@/components/marketing/Backgrounds";
import ChatDemo from "@/components/marketing/ChatDemo";
import CtaBanner from "@/components/marketing/CtaBanner";
import DashboardPreview from "@/components/marketing/DashboardPreview";
import Faq from "@/components/marketing/Faq";
import KnowledgeVisual from "@/components/marketing/KnowledgeVisual";
import LanguagesVisual from "@/components/marketing/LanguagesVisual";
import {
  CountUp,
  DrawLine,
  Magnetic,
  ParallaxLayer,
  ParallaxScene,
  Reveal,
  ScrollTilt,
  Spotlight,
  Stagger,
  StaggerItem,
  TextReveal,
  Tilt,
} from "@/components/marketing/motion";
import PricingCards from "@/components/marketing/PricingCards";
import SectionHeading from "@/components/marketing/SectionHeading";
import TemplateIcon from "@/components/TemplateIcon";
import { BRAND } from "@/lib/brand";
import { FAQS, FEATURES, HERO_CHAT, INDUSTRIES, PAINS, STEPS } from "@/lib/marketing";

export const metadata: Metadata = {
  title: { absolute: `${BRAND.name}: AI chat assistants that answer your customers 24/7` },
  description:
    "An AI assistant for your business that replies instantly in English, Urdu and Roman Urdu, learns from your website and documents, and sends you every lead.",
};

const STATS = [
  { to: 24, suffix: "/7", label: "Answers every hour of every day" },
  { to: 3, suffix: "", label: "Languages: English, Urdu, Roman Urdu" },
  { to: 6, suffix: "", label: "Industries ready to go" },
  { to: 1, suffix: " line", label: "Of code to add it to your website" },
];

export default function HomePage() {
  return (
    <>
      {/* Hero with mouse-driven depth */}
      <ParallaxScene className="relative overflow-hidden">
        <BlobField variant="hero" />
        <div className="mk-grid absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 75% 60% at 50% 0%, black, transparent)" }} aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-4 pb-16 pt-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-24">
          <div>
            <Reveal y={16}>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 rounded-full border border-mk-secondary bg-white/80 px-3 py-1.5 text-sm text-mk-primary shadow-sm backdrop-blur transition hover:border-mk-primary/40"
              >
                <Sparkles className="h-4 w-4" aria-hidden />
                Learns from your PDFs, Word files and website
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Reveal>
            <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-tight text-mk-text sm:text-6xl lg:text-7xl">
              <TextReveal text="Turn every message into a customer" highlight={["customer"]} />
            </h1>
            <Reveal delay={0.35}>
              <p className="mt-6 max-w-xl text-lg leading-8 text-mk-muted">
                {BRAND.name} gives your business an AI assistant that replies instantly in English, Urdu and Roman Urdu, answers from your own
                prices and policies, and sends every lead straight to your dashboard.
              </p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Magnetic>
                  <Link
                    href="/contact"
                    className="group inline-flex items-center gap-2 rounded-full bg-mk-primary px-7 py-3.5 font-semibold text-white shadow-xl shadow-mk-primary/30 transition hover:bg-mk-primary-dark"
                  >
                    Book a free demo
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link
                    href="/pricing"
                    className="inline-flex items-center rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 font-semibold text-mk-text backdrop-blur transition hover:border-mk-primary/40"
                  >
                    See pricing
                  </Link>
                </Magnetic>
              </div>
              <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-mk-muted">
                {["Free trial available", "Set up in a day", "No coding needed"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-mk-primary" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={40} className="relative mx-auto w-full max-w-sm lg:mr-0">
            <ParallaxLayer depth={-18} className="absolute -inset-16 -z-0">
              <BlobShape className="h-full w-full opacity-70" />
            </ParallaxLayer>
            <ParallaxLayer depth={14} className="relative">
              <Tilt max={6} scale={1}>
                <div className="mk-float">
                  <ChatDemo {...HERO_CHAT} />
                </div>
              </Tilt>
              <div className="mx-auto mt-6 h-6 w-3/4 rounded-[100%] bg-slate-900/15 blur-xl" aria-hidden />
            </ParallaxLayer>
            <ParallaxLayer depth={42} className="absolute -left-20 top-14 hidden sm:block">
              <div className="mk-float-slow flex items-center gap-3 rounded-2xl border border-white bg-white/90 p-3 pr-5 shadow-2xl shadow-slate-900/15 backdrop-blur" aria-hidden>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Target className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-mk-text">New lead saved</p>
                  <p className="text-xs text-mk-muted">Ayesha · 0300-1234567</p>
                </div>
              </div>
            </ParallaxLayer>
            <ParallaxLayer depth={56} className="absolute -bottom-2 -right-12 hidden sm:block">
              <div className="mk-float flex items-center gap-3 rounded-2xl border border-white bg-white/90 p-3 pr-5 shadow-2xl shadow-slate-900/15 backdrop-blur" aria-hidden>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-mk-primary">
                  <Languages className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-mk-text">Replied in Roman Urdu</p>
                  <p className="text-xs text-mk-muted">24/7, even at 2am</p>
                </div>
              </div>
            </ParallaxLayer>
          </Reveal>
        </div>

        {/* Stats */}
        <div className="relative mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {STATS.map((stat) => (
              <StaggerItem key={stat.label}>
                <div className="h-full rounded-3xl border border-white bg-white/70 p-5 shadow-lg shadow-slate-900/5 backdrop-blur">
                  <CountUp to={stat.to} suffix={stat.suffix} className="text-3xl font-semibold tracking-tight text-mk-primary sm:text-4xl" />
                  <p className="mt-1 text-sm text-mk-muted">{stat.label}</p>
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <WaveDivider fill="#ffffff" />
      </ParallaxScene>

      {/* Industries strip */}
      <section className="bg-white pb-8 pt-2">
        <p className="text-center text-sm font-medium text-mk-muted">Made for businesses that live on customer messages</p>
        <div className="relative mt-5 overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}>
          <div className="mk-marquee flex w-max gap-4 px-4">
            {[...INDUSTRIES, ...INDUSTRIES].map((industry, i) => {
              const duplicate = i >= INDUSTRIES.length;
              return (
                <Link
                  key={`${industry.slug}-${i}`}
                  href={`/industries/${industry.slug}`}
                  aria-hidden={duplicate}
                  tabIndex={duplicate ? -1 : undefined}
                  className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-mk-text shadow-sm transition hover:-translate-y-0.5 hover:border-mk-secondary hover:shadow-md"
                >
                  <span style={{ color: industry.color }}>
                    <TemplateIcon icon={industry.icon} className="h-4 w-4" />
                  </span>
                  {industry.name}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="The problem"
              title="Missed messages are missed sales"
              text="Customers expect an answer now. When the reply is slow, they simply message the next business."
            />
          </Reveal>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {PAINS.map((pain) => (
              <StaggerItem key={pain.title}>
                <Tilt max={6} className="h-full">
                  <Spotlight color="rgba(255, 111, 177, 0.12)" className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                      <pain.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-mk-text">{pain.title}</h3>
                    <p className="mt-2 leading-7 text-mk-muted">{pain.text}</p>
                  </Spotlight>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden bg-mk-background py-24">
        <BlobField variant="soft" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="The solution"
              title="An assistant that knows your business inside out"
              text="Everything a great front desk does, working every hour of every day."
            />
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.title}>
                <Tilt max={7} className="h-full">
                  <Spotlight className="h-full rounded-3xl border border-white bg-white/80 p-6 shadow-lg shadow-slate-900/5 backdrop-blur">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-mk-primary to-[#34465e] text-white shadow-md shadow-mk-primary/30">
                      <feature.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-semibold text-mk-text">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-mk-muted">{feature.text}</p>
                  </Spotlight>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="How it works" title="Live in three simple steps" />
          </Reveal>
          <div className="relative mt-14">
            <DrawLine className="absolute left-[16%] right-[16%] top-7 hidden h-0.5 rounded-full bg-linear-to-r from-mk-secondary via-mk-primary to-mk-accent md:block" />
            <Stagger className="relative grid gap-6 md:grid-cols-3" gap={0.18}>
              {STEPS.map((step, i) => (
                <StaggerItem key={step.title}>
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-mk-primary to-[#34465e] text-lg font-semibold text-white shadow-lg shadow-mk-primary/30 ring-8 ring-white">
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

      {/* Knowledge */}
      <section className="relative overflow-hidden bg-mk-background py-24">
        <WaveDivider fill="#f7f8fa" flip className="absolute inset-x-0 top-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-6 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Trained on your business"
              title="Your prices. Your policies. Your answers."
              text="Upload your price list, brochure or menu, or simply import your website. Your assistant reads everything and answers from it, so customers get the right details every time."
            />
            <ul className="mt-8 space-y-3 text-mk-text">
              {["PDF and Word documents", "Your website, page by page", "Quick notes for timings, delivery and offers", "Update anytime; changes apply instantly"].map(
                (t) => (
                  <li key={t} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-mk-primary" aria-hidden />
                    {t}
                  </li>
                ),
              )}
            </ul>
          </Reveal>
          <Reveal delay={0.15}>
            <Tilt max={5} scale={1}>
              <KnowledgeVisual />
            </Tilt>
          </Reveal>
        </div>
      </section>

      {/* Languages */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Speaks like your customers"
              title="English, Urdu or Roman Urdu. Automatically."
              text="Customers write the way they talk. Your assistant replies in the same language, every time."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <LanguagesVisual />
          </Reveal>
        </div>
      </section>

      {/* Dashboard with scroll-driven 3D */}
      <section className="relative overflow-hidden bg-linear-to-b from-white via-slate-50 to-mk-background py-24">
        <BlobField variant="corner" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Your dashboard"
              title="Every lead, every chat, in one place"
              text="See who's interested, what they want and how to reach them, then follow up in one tap."
            />
          </Reveal>
          <ScrollTilt className="mx-auto mt-14 max-w-4xl">
            <DashboardPreview tone="light" />
          </ScrollTilt>
          <p className="mt-4 text-center text-xs text-mk-muted">Illustration with sample data</p>
          <Stagger className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {[
              "Leads with name, phone and what they need",
              "One-tap WhatsApp follow-up and Excel export",
              "Chats and leads per day",
              "Alerts when a customer asks for a real person",
            ].map((t) => (
              <StaggerItem key={t}>
                <p className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 text-mk-text shadow-sm backdrop-blur">
                  <Check className="h-5 w-5 shrink-0 text-mk-primary" aria-hidden />
                  {t}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Industries"
              title="Ready-made for your kind of business"
              text="Start from an assistant already set up for your industry, then make it yours."
            />
          </Reveal>
          <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
            {INDUSTRIES.map((industry) => (
              <StaggerItem key={industry.slug}>
                <Tilt max={8} className="h-full">
                  <Link
                    href={`/industries/${industry.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:border-mk-secondary hover:shadow-2xl hover:shadow-slate-900/10"
                  >
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl transition group-hover:scale-110"
                      style={{ background: `${industry.color}18`, color: industry.color }}
                    >
                      <TemplateIcon icon={industry.icon} className="h-6 w-6" />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-mk-text">{industry.name}</h3>
                    <p className="mt-2 flex-1 leading-7 text-mk-muted">{industry.headline}</p>
                    <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-mk-primary">
                      See how it works
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" aria-hidden />
                    </span>
                  </Link>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative overflow-hidden bg-mk-background py-24">
        <BlobField variant="soft" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Pricing"
              title="Simple monthly plans in rupees"
              text="Start small and grow. Every plan includes the website chat bubble, chat link and lead capture."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <PricingCards />
          </Reveal>
          <p className="mt-8 text-center text-sm text-mk-muted">
            Free trial available.{" "}
            <Link href="/pricing" className="font-medium text-mk-primary hover:underline">
              Compare all plan features
            </Link>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Questions, answered" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <Faq items={FAQS} />
          </Reveal>
        </div>
      </section>

      <div className="bg-white">
        <CtaBanner />
      </div>
    </>
  );
}
