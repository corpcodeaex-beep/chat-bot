import { listCompanies } from "./clients";
import { listBots } from "./db";
import { formatDay } from "./format";
import { getPlan, PLAN_KEYS, type PlanKey } from "./plans";
import { db } from "./sql";
import { accessState, currentMonth, effectiveLimit } from "./usage";

// Numbers for the admin Overview page, across every company.

export type AttentionKind = "limit_reached" | "near_limit" | "trial_ending" | "trial_ended" | "whatsapp_error";

export interface AttentionItem {
  key: string;
  href: string;
  title: string;
  subtitle?: string;
  kind: AttentionKind;
  detail: string;
}

const DAY = 24 * 60 * 60 * 1000;

export async function getPlatformOverview(now = new Date()) {
  const sql = await db();
  const month = currentMonth(now);
  const [bots, companies, usageRows, [counts], whatsappErrors] = await Promise.all([
    listBots(),
    listCompanies(),
    sql.query("SELECT bot_id, messages, blocked, input_tokens, output_tokens FROM usage_monthly WHERE month = $1", [month]),
    sql.query(`SELECT
      (SELECT count(*) FROM leads)::int AS leads,
      (SELECT count(*) FROM leads WHERE created_at > now() - interval '7 days')::int AS leads_week,
      (SELECT count(*) FROM conversations)::int AS conversations,
      (SELECT count(*) FROM conversations WHERE needs_human)::int AS needs_human`),
    sql.query("SELECT bot_id, last_error FROM whatsapp_accounts WHERE last_error IS NOT NULL"),
  ]);

  const attention: AttentionItem[] = [];

  // ---- Companies: plans, revenue, limits and trials are per company ----
  const companyCounts = { total: companies.length, active: 0, inactive: 0, trial: 0 };
  const planCounts = Object.fromEntries(PLAN_KEYS.map((k) => [k, 0])) as Record<PlanKey, number>;
  const revenue = { monthlyPkr: 0, payingCompanies: 0, customPriced: 0 };

  for (const company of companies) {
    const state = accessState({ trialEndsAt: company.trialEndsAt, companyStatus: company.status }, now);
    const plan = getPlan(company.plan);
    if (company.status === "active") companyCounts.active++;
    else companyCounts.inactive++;
    if (state === "trial") companyCounts.trial++;
    planCounts[plan.key]++;

    // Revenue: active companies that are not on a free trial.
    if (state === "active") {
      if (plan.priceMonthly === null) revenue.customPriced++;
      else {
        revenue.monthlyPkr += plan.priceMonthly;
        revenue.payingCompanies++;
      }
    }

    const base = { href: `/dashboard/companies/${company.id}`, title: company.name, subtitle: `${plan.label} plan` };
    const limit = effectiveLimit(company);
    const used = company.repliesThisMonth;
    if (state === "active" || state === "trial") {
      if (limit !== null && used >= limit) {
        attention.push({ ...base, key: `${company.id}-limit`, kind: "limit_reached", detail: `Used all ${limit.toLocaleString("en-PK")} replies this month` });
      } else if (limit !== null && used >= limit * 0.8) {
        attention.push({ ...base, key: `${company.id}-near`, kind: "near_limit", detail: `${Math.round((used / limit) * 100)}% of monthly replies used` });
      }
    }
    if (state === "trial" && company.trialEndsAt && Date.parse(company.trialEndsAt) - now.getTime() <= 7 * DAY) {
      attention.push({ ...base, key: `${company.id}-trial`, kind: "trial_ending", detail: `Free trial ends ${formatDay(company.trialEndsAt)}` });
    }
    if (state === "trial_ended") {
      attention.push({ ...base, key: `${company.id}-ended`, kind: "trial_ended", detail: "Trial ended: bots are not answering" });
    }
  }

  // ---- Bots ----
  const usage = new Map(usageRows.map((r) => [String(r.bot_id), r]));
  const botCounts = { total: bots.length, active: 0, trial: 0, notAnswering: 0, unassigned: 0 };
  const monthTotals = { replies: 0, blocked: 0, inputTokens: 0, outputTokens: 0 };
  for (const bot of bots) {
    const u = usage.get(bot.id);
    monthTotals.replies += Number(u?.messages ?? 0);
    monthTotals.blocked += Number(u?.blocked ?? 0);
    monthTotals.inputTokens += Number(u?.input_tokens ?? 0);
    monthTotals.outputTokens += Number(u?.output_tokens ?? 0);
    if (!bot.clientId) botCounts.unassigned++;
    const state = accessState(bot, now);
    if (state === "active") botCounts.active++;
    else if (state === "trial") botCounts.trial++;
    else botCounts.notAnswering++;
  }

  const botsById = new Map(bots.map((b) => [b.id, b]));
  const companyNames = new Map(companies.map((c) => [c.id, c.name]));
  for (const row of whatsappErrors) {
    const bot = botsById.get(String(row.bot_id));
    if (!bot) continue;
    attention.push({
      key: `${bot.id}-whatsapp`,
      href: `/dashboard/bots/${bot.id}`,
      title: bot.businessName,
      subtitle: bot.clientId ? companyNames.get(bot.clientId) : undefined,
      kind: "whatsapp_error",
      detail: `WhatsApp: ${String(row.last_error).slice(0, 120)}`,
    });
  }

  return {
    month,
    companies: companyCounts,
    bots: botCounts,
    plans: planCounts,
    monthTotals,
    revenue,
    leads: { total: Number(counts.leads), thisWeek: Number(counts.leads_week) },
    conversations: Number(counts.conversations),
    needsHuman: Number(counts.needs_human),
    topCompanies: [...companies]
      .sort((a, b) => b.repliesThisMonth - a.repliesThisMonth)
      .slice(0, 5)
      .map((c) => ({ id: c.id, name: c.name, replies: c.repliesThisMonth, status: c.status })),
    attention,
  };
}
