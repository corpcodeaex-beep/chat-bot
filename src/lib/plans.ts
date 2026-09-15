// Subscription plans, set per company. Prices are in PKR per month; change them here.

export type PlanKey = "starter" | "standard" | "pro" | "enterprise";

export interface Plan {
  key: PlanKey;
  label: string;
  /** PKR per month; null = custom price. */
  priceMonthly: number | null;
  /** Bot replies per month, shared by all of the company's bots; null = unlimited. */
  monthlyMessages: number | null;
  /** How many bots the company can create; null = unlimited. */
  maxBots: number | null;
  whatsapp: boolean;
  /** Imported documents/websites per bot; null = unlimited. */
  maxSources: number | null;
  description: string;
}

export const PLANS: Record<PlanKey, Plan> = {
  starter: {
    key: "starter",
    label: "Starter",
    priceMonthly: 5000,
    monthlyMessages: 1000,
    maxBots: 1,
    whatsapp: false,
    maxSources: 3,
    description: "One website chat bot for small shops and salons",
  },
  standard: {
    key: "standard",
    label: "Standard",
    priceMonthly: 12000,
    monthlyMessages: 5000,
    maxBots: 2,
    whatsapp: false,
    maxSources: 15,
    description: "AI answers from documents and websites, for clinics, real estate and online stores",
  },
  pro: {
    key: "pro",
    label: "Pro",
    priceMonthly: 30000,
    monthlyMessages: 20000,
    maxBots: 5,
    whatsapp: true,
    maxSources: 50,
    description: "Website + WhatsApp, higher volume, for growing and multi-branch businesses",
  },
  enterprise: {
    key: "enterprise",
    label: "Enterprise",
    priceMonthly: null,
    monthlyMessages: null,
    maxBots: null,
    whatsapp: true,
    maxSources: null,
    description: "Custom limits and integrations",
  },
};

export const PLAN_KEYS = Object.keys(PLANS) as PlanKey[];

export const getPlan = (key: string): Plan => PLANS[key as PlanKey] ?? PLANS.standard;

export function planPriceLabel(plan: Plan) {
  return plan.priceMonthly === null ? "Custom price" : `PKR ${plan.priceMonthly.toLocaleString("en-PK")}/month`;
}

const count = (n: number | null, one: string, many: string) => (n === null ? `Unlimited ${many}` : `${n.toLocaleString("en-PK")} ${n === 1 ? one : many}`);

/** Short feature lines for a plan, e.g. in selects and plan cards. */
export function planFeatures(plan: Plan, messageLimit?: number) {
  return [
    `${count(messageLimit ?? plan.monthlyMessages, "reply", "replies")} per month`,
    count(plan.maxBots, "bot", "bots"),
    plan.maxSources === null ? "Unlimited documents/websites per bot" : `Up to ${plan.maxSources} documents/websites per bot`,
    plan.whatsapp ? "WhatsApp included" : "No WhatsApp",
  ];
}
