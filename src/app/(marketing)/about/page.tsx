import { Eye, HeartHandshake, Languages, MapPin, ShieldCheck, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import CtaBanner from "@/components/marketing/CtaBanner";
import { Reveal, Stagger, StaggerItem, Tilt } from "@/components/marketing/motion";
import PageHero from "@/components/marketing/PageHero";
import SectionHeading from "@/components/marketing/SectionHeading";
import { BRAND } from "@/lib/brand";
import { SITE } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "About us",
  description: `${BRAND.name} is built by ${SITE.company} in ${SITE.contact.location} to help businesses answer every customer, in their language.`,
};

const VALUES = [
  { icon: Languages, title: "Local first", text: "Built for how customers in Pakistan really write: English, Urdu script and Roman Urdu, often in the same message." },
  { icon: Eye, title: "Honest by design", text: "Assistants answer from your own information, say when they don't know, and hand over to your team when a person is needed." },
  { icon: ShieldCheck, title: "Private and secure", text: "Each business sees only its own chats and leads. We never sell data or use it for advertising." },
  { icon: HeartHandshake, title: "Real support", text: "We set up your assistant with you, and stay a phone call away when you need changes." },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Helping businesses answer every customer"
        highlight={["every", "customer"]}
        text={`${BRAND.name} is built by ${SITE.company}, a software company in ${SITE.contact.location}.`}
      />

      <section className="bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-24 pt-4 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Why we built it"
              title="Customers message at all hours. Businesses can't always reply."
              text="Clinics, shops, schools and agencies lose customers every day to unanswered messages and slow replies. We built an assistant that answers instantly from the business's own information, in the customer's language, and makes sure every interested customer reaches the team."
            />
          </Reveal>
          <Reveal delay={0.15}>
            <Tilt max={5} scale={1}>
              <div className="relative overflow-hidden rounded-[2rem] bg-linear-to-br from-mk-primary-dark via-mk-primary to-[#2c3b50] p-8 text-white shadow-2xl shadow-mk-primary/25 sm:p-10">
                <Sparkles className="h-8 w-8 text-mk-accent" aria-hidden />
                <p className="mt-6 text-2xl font-semibold leading-snug">
                  Our goal is simple: no customer question should go unanswered, and no lead should be lost.
                </p>
                <p className="mt-6 flex items-center gap-2 text-sm text-white/75">
                  <MapPin className="h-4 w-4 text-mk-accent" aria-hidden />
                  {SITE.company}, {SITE.contact.location}
                </p>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </section>

      <section className="bg-mk-background py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="What we believe" title="The principles behind every assistant" />
          </Reveal>
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((value) => (
              <StaggerItem key={value.title}>
                <Tilt max={6} className="h-full">
                  <div className="h-full rounded-3xl border border-white bg-white/85 p-7 shadow-sm backdrop-blur">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mk-primary text-mk-accent">
                      <value.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="mt-5 text-lg font-semibold text-mk-text">{value.title}</h2>
                    <p className="mt-2 leading-7 text-mk-muted">{value.text}</p>
                  </div>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-white">
        <CtaBanner title="Let's build your assistant together" />
      </section>
    </>
  );
}
