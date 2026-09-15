import { Bell, Check, Globe, Link2, Lock, MessageCircle, ShieldCheck, UserRound, Users } from "lucide-react";
import type { Metadata } from "next";
import { BlobField, BlobShape, WaveDivider } from "@/components/marketing/Backgrounds";
import ChatDemo from "@/components/marketing/ChatDemo";
import CtaBanner from "@/components/marketing/CtaBanner";
import DashboardPreview from "@/components/marketing/DashboardPreview";
import KnowledgeVisual from "@/components/marketing/KnowledgeVisual";
import LanguagesVisual from "@/components/marketing/LanguagesVisual";
import { Reveal, ScrollTilt, Spotlight, Stagger, StaggerItem, Tilt } from "@/components/marketing/motion";
import PageHero from "@/components/marketing/PageHero";
import SectionHeading from "@/components/marketing/SectionHeading";
import { FEATURES, SITE, type DemoMessage } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Features",
  description: "Everything your AI chat assistant does: learns from your documents and website, speaks Urdu and Roman Urdu, captures leads and more.",
};

const LEAD_CHAT: DemoMessage[] = [
  { from: "customer", text: "Mujhe insaan se baat karni hai" },
  { from: "bot", text: "Of course! I'll ask our team to contact you. Please share your **name and phone number**." },
  { from: "customer", text: "Usman, 0333-5557788" },
  { from: "bot", text: "Thank you Usman! A team member will call you shortly." },
];

export default function FeaturesPage() {
  const channels = [
    { icon: Globe, title: "Website chat bubble", text: "One line of code adds a chat bubble to any website: WordPress, Shopify, Wix or custom.", badge: "" },
    { icon: Link2, title: "Shareable chat link", text: "No website? Put your assistant's link in your Instagram bio, Facebook page or Google profile.", badge: "" },
    {
      icon: MessageCircle,
      title: "WhatsApp",
      text: "Answer customers on your WhatsApp Business number with the same knowledge and lead capture.",
      badge: SITE.whatsappLive ? "Pro & Enterprise" : "Coming soon",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Features"
        title="Everything a great front desk does, around the clock"
        highlight={["around", "the", "clock"]}
        text="Answer questions, capture leads and keep your team in the loop, without hiring extra staff."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-4 sm:px-6">
          <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" gap={0.06}>
            {FEATURES.map((feature) => (
              <StaggerItem key={feature.title}>
                <Tilt max={7} className="h-full">
                  <Spotlight className="h-full rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br from-mk-primary to-[#34465e] text-white shadow-md shadow-mk-primary/30">
                      <feature.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h2 className="mt-5 font-semibold text-mk-text">{feature.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-mk-muted">{feature.text}</p>
                  </Spotlight>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mk-background py-24">
        <WaveDivider fill="#f7f5f0" flip className="absolute inset-x-0 top-0" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pt-6 sm:px-6 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              align="left"
              eyebrow="Knowledge"
              title="Answers from your information, not guesses"
              text="Import your website page by page, upload PDF and Word files, and add quick notes for timings and offers. Replace a document whenever prices change, and your assistant uses the new version straight away."
            />
          </Reveal>
          <Reveal delay={0.15}>
            <Tilt max={5} scale={1}>
              <KnowledgeVisual />
            </Tilt>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading
              eyebrow="Languages"
              title="Replies the way your customers write"
              text="English, Urdu script or Roman Urdu: the assistant follows the customer's lead, or you can fix one language."
            />
          </Reveal>
          <Reveal delay={0.1} className="mt-14">
            <LanguagesVisual />
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mk-background py-24">
        <BlobField variant="soft" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2">
          <Reveal className="relative mx-auto w-full max-w-sm">
            <BlobShape className="mk-float-slow absolute -inset-14 h-[calc(100%+7rem)] w-[calc(100%+7rem)] opacity-60" />
            <Tilt max={6} scale={1} className="relative">
              <ChatDemo title="Your business" color="#1e2a3a" messages={LEAD_CHAT} />
            </Tilt>
          </Reveal>
          <Reveal delay={0.15}>
            <SectionHeading
              align="left"
              eyebrow="Leads & handoff"
              title="From a question to a customer you can call"
              text="Your assistant asks for contact details at the right moment, saves the lead with what the customer needs, and flags chats that need a human."
            />
            <ul className="mt-8 space-y-3 text-mk-text">
              {[
                "Name, phone, email and what they need",
                "Preferred appointment or delivery time",
                "Orders with items, quantity and address",
                "Human handoff when a customer asks for a person",
              ].map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-mk-primary" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Channels" title="Be where your customers already are" />
          </Reveal>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {channels.map((channel) => (
              <StaggerItem key={channel.title}>
                <Tilt max={7} className="h-full">
                  <Spotlight className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    {channel.badge && (
                      <span className="absolute right-6 top-6 rounded-full bg-mk-secondary/40 px-3 py-1 text-xs font-semibold text-mk-primary">{channel.badge}</span>
                    )}
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mk-text text-white">
                      <channel.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-mk-text">{channel.title}</h3>
                    <p className="mt-2 leading-7 text-mk-muted">{channel.text}</p>
                  </Spotlight>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="relative overflow-hidden bg-linear-to-b from-white via-stone-50 to-mk-background py-24">
        <BlobField variant="corner" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Dashboard" title="Know exactly what your assistant is doing" text="Leads, chats, activity charts and notifications for every business." />
          </Reveal>
          <ScrollTilt className="mx-auto mt-14 max-w-4xl">
            <DashboardPreview tone="light" />
          </ScrollTilt>
          <p className="mt-4 text-center text-xs text-mk-muted">Illustration with sample data</p>
          <Stagger className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2">
            {[
              { icon: Users, text: "Latest leads with one-tap WhatsApp" },
              { icon: Bell, text: "Alerts for handoffs and limits" },
              { icon: UserRound, text: "Full chat history" },
              { icon: Check, text: "Chats and leads per day" },
            ].map((item) => (
              <StaggerItem key={item.text}>
                <p className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3 text-mk-text shadow-sm backdrop-blur">
                  <item.icon className="h-5 w-5 shrink-0 text-mk-primary" aria-hidden />
                  {item.text}
                </p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Security & control" title="Your business data stays yours" />
          </Reveal>
          <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              { icon: Lock, title: "Private by company", text: "Each business has its own login. Its knowledge, chats and leads are visible only to that business." },
              { icon: ShieldCheck, title: "Protected accounts", text: "Passwords are stored hashed, logins are signed, and password reset links expire after one hour." },
              { icon: Bell, title: "Clear limits", text: "Monthly reply limits keep costs predictable, with notifications before you run out." },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <Tilt max={6} className="h-full">
                  <div className="h-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
                    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                      <item.icon className="h-5 w-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold text-mk-text">{item.title}</h3>
                    <p className="mt-2 leading-7 text-mk-muted">{item.text}</p>
                  </div>
                </Tilt>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
        <CtaBanner />
      </section>
    </>
  );
}
