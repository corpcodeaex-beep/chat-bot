import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import { BlobField } from "@/components/marketing/Backgrounds";
import CtaBanner from "@/components/marketing/CtaBanner";
import Faq from "@/components/marketing/Faq";
import { Reveal } from "@/components/marketing/motion";
import PageHero from "@/components/marketing/PageHero";
import PricingCards from "@/components/marketing/PricingCards";
import SectionHeading from "@/components/marketing/SectionHeading";
import { SITE } from "@/lib/marketing";
import { PLAN_KEYS, PLANS, type Plan } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple monthly plans in Pakistani rupees for AI chat assistants: Starter, Standard, Pro and Enterprise.",
};

type Cell = boolean | string;

const n = (v: number) => v.toLocaleString("en-PK");

const ROWS: { label: string; value: (plan: Plan) => Cell }[] = [
  { label: "Replies per month", value: (p) => (p.monthlyMessages === null ? "Unlimited" : n(p.monthlyMessages)) },
  { label: "Assistants", value: (p) => (p.maxBots === null ? "Unlimited" : String(p.maxBots)) },
  { label: "Documents or websites per assistant", value: (p) => (p.maxSources === null ? "Unlimited" : String(p.maxSources)) },
  { label: "Website chat bubble & chat link", value: () => true },
  { label: "Answers from your PDFs, Word files & website", value: () => true },
  { label: "English, Urdu & Roman Urdu", value: () => true },
  { label: "Lead capture, WhatsApp follow-up link & Excel export", value: () => true },
  { label: "Human handoff alerts", value: () => true },
  { label: "Activity charts & notifications", value: () => true },
  { label: "WhatsApp channel", value: (p) => (p.whatsapp ? (SITE.whatsappLive ? true : "Coming soon") : false) },
  { label: "Custom limits & integrations", value: (p) => p.key === "enterprise" },
];

const PRICING_FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes. We set up an assistant with your business details so you can see it answer real questions before you pay.",
  },
  {
    q: "What counts as a reply?",
    a: "Each answer your assistant sends to a customer is one reply. All assistants of your business share the plan's monthly replies.",
  },
  {
    q: "What happens if we reach the limit?",
    a: "Customers see a polite message asking them to contact you directly, and you are notified. You can move to a bigger plan at any time.",
  },
  {
    q: "Can we change plans later?",
    a: "Yes. Upgrade or downgrade whenever you need; your assistants, knowledge and leads stay exactly as they are.",
  },
  {
    q: "Do you offer custom pricing?",
    a: "The Enterprise plan is built around your needs: higher limits, more assistants and integrations. Contact us for a quote.",
  },
];

function CellValue({ value }: { value: Cell }) {
  if (value === true) return <Check className="mx-auto h-5 w-5 text-mk-primary" aria-label="Included" />;
  if (value === false) return <Minus className="mx-auto h-5 w-5 text-slate-300" aria-label="Not included" />;
  return <span className="rounded-full bg-mk-secondary/40 px-2.5 py-1 text-xs font-medium text-mk-primary">{value}</span>;
}

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Plans that pay for themselves with a single customer"
        highlight={["single", "customer"]}
        text="Simple monthly pricing in rupees. Every plan includes AI answers from your own information, lead capture and your dashboard."
      />

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-4 sm:px-6">
          <PricingCards />
          <p className="mt-8 text-center text-sm text-mk-muted">Prices in Pakistani rupees per month. Free trial available.</p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-mk-background py-24">
        <BlobField variant="soft" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="Compare" title="Compare plans" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <div className="overflow-x-auto rounded-3xl border border-white bg-white/85 shadow-xl shadow-slate-900/5 backdrop-blur">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="px-6 py-5 text-left font-semibold text-mk-text">Features</th>
                    {PLAN_KEYS.map((key) => (
                      <th key={key} className={`px-4 py-5 text-center font-semibold ${key === "standard" ? "text-mk-primary" : "text-mk-text"}`}>
                        {PLANS[key].label}
                        <div className="mt-1 text-xs font-normal text-mk-muted">
                          {PLANS[key].priceMonthly === null ? "Custom" : `PKR ${n(PLANS[key].priceMonthly!)}/mo`}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ROWS.map((row) => (
                    <tr key={row.label} className="transition hover:bg-mk-secondary/15">
                      <td className="px-6 py-4 text-mk-text">{row.label}</td>
                      {PLAN_KEYS.map((key) => (
                        <td key={key} className="px-4 py-4 text-center">
                          <CellValue value={row.value(PLANS[key])} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Pricing questions" />
          </Reveal>
          <Reveal delay={0.1} className="mt-12">
            <Faq items={PRICING_FAQS} />
          </Reveal>
        </div>
        <CtaBanner title="Not sure which plan fits?" text="Tell us about your business and we'll recommend a plan and set up a free demo assistant for you." />
      </section>
    </>
  );
}
