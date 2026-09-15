import { CalendarCheck, Mail, MapPin, MessageCircle, Phone, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import ContactForm from "./ContactForm";
import { BlobField, BlobShape } from "@/components/marketing/Backgrounds";
import { Reveal, Stagger, StaggerItem, TextReveal } from "@/components/marketing/motion";
import { INDUSTRIES, SITE } from "@/lib/marketing";
import { PLAN_KEYS, PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Book a free demo",
  description: "Tell us about your business and we'll set up a free demo AI assistant that answers your customers.",
};

export default async function ContactPage({ searchParams }: PageProps<"/contact">) {
  const { plan, industry } = await searchParams;

  return (
    <section className="relative overflow-hidden">
      <BlobField variant="hero" />
      <div className="mk-grid absolute inset-0" style={{ maskImage: "radial-gradient(ellipse 80% 60% at 30% 0%, black, transparent)" }} aria-hidden />
      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-24 pt-14 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:pt-20">
        <div>
          <Reveal y={12}>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-mk-primary shadow-sm ring-1 ring-mk-secondary backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-mk-accent" aria-hidden />
              Book a free demo
            </p>
          </Reveal>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-mk-text sm:text-5xl">
            <TextReveal text="See your own AI assistant in action" highlight={["AI", "assistant"]} />
          </h1>
          <Reveal delay={0.3}>
            <p className="mt-6 text-lg leading-8 text-mk-muted">
              Tell us a little about your business. We&apos;ll set up a demo assistant with your details so you can watch it answer your
              customers&apos; real questions.
            </p>
          </Reveal>

          <Stagger className="mt-10 space-y-5" gap={0.12}>
            {[
              { icon: Sparkles, title: "We build your demo", text: "Using your website, price list or brochure." },
              { icon: CalendarCheck, title: "We walk you through it", text: "A short call to show answers, leads and the dashboard." },
              { icon: MessageCircle, title: "You try it yourself", text: "Chat with it, share it with your team, then decide." },
            ].map((step) => (
              <StaggerItem key={step.title}>
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-mk-primary to-[#34465e] text-white shadow-md shadow-mk-primary/30">
                    <step.icon className="h-5 w-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold text-mk-text">{step.title}</p>
                    <p className="text-mk-muted">{step.text}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.2}>
            <div className="mt-10 space-y-3 rounded-3xl border border-white bg-white/75 p-6 text-sm text-mk-text shadow-lg shadow-slate-900/5 backdrop-blur">
              <p className="font-semibold">Prefer to talk directly?</p>
              <a href={`mailto:${SITE.contact.email}`} className="flex items-center gap-2 hover:text-mk-primary">
                <Mail className="h-4 w-4 text-mk-primary" aria-hidden />
                {SITE.contact.email}
              </a>
              {SITE.contact.phones.map((phone) => (
                <a key={phone} href={`tel:${phone.replace(/\s+/g, "")}`} className="flex items-center gap-2 hover:text-mk-primary">
                  <Phone className="h-4 w-4 text-mk-primary" aria-hidden />
                  {phone}
                </a>
              ))}
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-mk-primary" aria-hidden />
                {SITE.contact.location}
              </p>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} y={40} className="relative">
          <BlobShape className="mk-float-slow absolute -right-20 -top-16 h-80 w-80 opacity-50" color="#5b7a99" />
          <div className="relative">
            <ContactForm
              industries={INDUSTRIES.map((i) => ({ slug: i.slug, name: i.name }))}
              plans={PLAN_KEYS.map((key) => ({ key, label: PLANS[key].label }))}
              defaultPlan={typeof plan === "string" && PLAN_KEYS.includes(plan as never) ? plan : ""}
              defaultIndustry={typeof industry === "string" && INDUSTRIES.some((i) => i.slug === industry) ? industry : ""}
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
