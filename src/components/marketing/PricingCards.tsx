import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { Stagger, StaggerItem, Tilt } from "./motion";
import { SITE } from "@/lib/marketing";
import { PLAN_KEYS, PLANS, type Plan } from "@/lib/plans";

const POPULAR = "standard";

function features(plan: Plan) {
  const n = (v: number) => v.toLocaleString("en-PK");
  return [
    { ok: true, text: plan.monthlyMessages === null ? "Unlimited replies" : `${n(plan.monthlyMessages)} replies per month` },
    { ok: true, text: plan.maxBots === null ? "Unlimited assistants" : `${plan.maxBots} ${plan.maxBots === 1 ? "assistant" : "assistants"}` },
    { ok: true, text: plan.maxSources === null ? "Unlimited documents & websites" : `${plan.maxSources} documents or websites per assistant` },
    { ok: true, text: "Website chat bubble & chat link" },
    { ok: true, text: "English, Urdu & Roman Urdu" },
    { ok: true, text: "Lead capture & Excel export" },
    { ok: plan.whatsapp, text: plan.whatsapp ? (SITE.whatsappLive ? "WhatsApp channel" : "WhatsApp channel (coming soon)") : "WhatsApp channel" },
  ];
}

export default function PricingCards() {
  return (
    <Stagger className="grid gap-6 pt-3 md:grid-cols-2 xl:grid-cols-4">
      {PLAN_KEYS.map((key) => {
        const plan = PLANS[key];
        const popular = key === POPULAR;
        return (
          <StaggerItem key={key} className="h-full">
          <Tilt max={5} className="h-full">
          <div
            className={`relative flex h-full flex-col rounded-3xl p-7 ${
              popular
                ? "bg-linear-to-br from-mk-text via-[#2a3547] to-mk-primary-dark text-white shadow-2xl shadow-mk-primary/30"
                : "border border-white bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur"
            }`}
          >
            {popular && (
              <span className="absolute -top-3 left-7 rounded-full bg-linear-to-r from-mk-primary to-mk-accent px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-mk-accent/30">
                Most popular
              </span>
            )}
            <h3 className={`text-lg font-semibold ${popular ? "text-white" : "text-slate-900"}`}>{plan.label}</h3>
            <p className={`mt-2 min-h-12 text-sm ${popular ? "text-slate-300" : "text-slate-600"}`}>{plan.description}</p>
            <p className="mt-6 flex items-baseline gap-1.5">
              {plan.priceMonthly === null ? (
                <span className="text-4xl font-semibold tracking-tight">Custom</span>
              ) : (
                <>
                  <span className={`text-sm font-medium ${popular ? "text-slate-300" : "text-slate-500"}`}>PKR</span>
                  <span className="text-4xl font-semibold tracking-tight">{plan.priceMonthly.toLocaleString("en-PK")}</span>
                  <span className={`text-sm ${popular ? "text-slate-300" : "text-slate-500"}`}>/month</span>
                </>
              )}
            </p>
            <Link
              href={`/contact?plan=${key}`}
              className={`mt-6 rounded-full py-2.5 text-center text-sm font-semibold transition ${
                popular ? "bg-white text-mk-text hover:bg-stone-50" : "bg-mk-primary text-white shadow-md shadow-mk-primary/25 hover:bg-mk-primary-dark"
              }`}
            >
              {plan.priceMonthly === null ? "Talk to us" : "Start free trial"}
            </Link>
            <ul className="mt-7 space-y-3 text-sm">
              {features(plan).map((f) => (
                <li key={f.text} className={`flex items-start gap-2.5 ${f.ok ? "" : popular ? "text-slate-500" : "text-slate-400"}`}>
                  {f.ok ? (
                    <Check className={`mt-0.5 h-4 w-4 shrink-0 ${popular ? "text-mk-secondary" : "text-mk-primary"}`} aria-label="Included" />
                  ) : (
                    <Minus className="mt-0.5 h-4 w-4 shrink-0" aria-label="Not included" />
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
          </div>
          </Tilt>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
