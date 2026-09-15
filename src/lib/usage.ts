import { getPlan } from "./plans";
import { db, type Row } from "./sql";
import type { Bot } from "./types";

// Monthly usage (months follow Pakistan time), used for plan limits and to see real AI cost.
// A company's bots share one monthly reply limit.

export function currentMonth(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit" }).formatToParts(date);
  return `${parts.find((p) => p.type === "year")?.value}-${parts.find((p) => p.type === "month")?.value}`;
}

export interface UsageMonth {
  month: string;
  messages: number;
  blocked: number;
  inputTokens: number;
  outputTokens: number;
}

const toUsage = (r: Row): UsageMonth => ({
  month: String(r.month),
  messages: Number(r.messages ?? 0),
  blocked: Number(r.blocked ?? 0),
  inputTokens: Number(r.input_tokens ?? 0),
  outputTokens: Number(r.output_tokens ?? 0),
});

const empty = (month: string): UsageMonth => ({ month, messages: 0, blocked: 0, inputTokens: 0, outputTokens: 0 });

export async function getUsageHistory(botId: string, months = 6) {
  const sql = await db();
  return (await sql.query("SELECT * FROM usage_monthly WHERE bot_id = $1 ORDER BY month DESC LIMIT $2", [botId, months])).map(toUsage);
}

/** Month-by-month totals across all of a company's bots. */
export async function getCompanyUsageHistory(clientId: string, months = 6) {
  const sql = await db();
  const rows = await sql.query(
    `SELECT u.month, sum(u.messages) AS messages, sum(u.blocked) AS blocked, sum(u.input_tokens) AS input_tokens, sum(u.output_tokens) AS output_tokens
     FROM usage_monthly u JOIN bots b ON b.id = u.bot_id WHERE b.client_id = $1
     GROUP BY u.month ORDER BY u.month DESC LIMIT $2`,
    [clientId, months],
  );
  return rows.map(toUsage);
}

export async function getMonthUsage(botId: string, month = currentMonth()): Promise<UsageMonth> {
  const sql = await db();
  const [row] = await sql.query("SELECT * FROM usage_monthly WHERE bot_id = $1 AND month = $2", [botId, month]);
  return row ? toUsage(row) : empty(month);
}

export async function getCompanyMonthUsage(clientId: string, month = currentMonth()): Promise<UsageMonth> {
  const sql = await db();
  const [row] = await sql.query(
    `SELECT $2::text AS month, sum(u.messages) AS messages, sum(u.blocked) AS blocked, sum(u.input_tokens) AS input_tokens, sum(u.output_tokens) AS output_tokens
     FROM usage_monthly u JOIN bots b ON b.id = u.bot_id WHERE b.client_id = $1 AND u.month = $2`,
    [clientId, month],
  );
  return row ? toUsage(row) : empty(month);
}

/** Usage counted against the bot's limit: the company total for company bots. */
export const getLimitUsage = (bot: Pick<Bot, "id" | "clientId">) =>
  bot.clientId ? getCompanyMonthUsage(bot.clientId) : getMonthUsage(bot.id);

export const effectiveLimit = (subject: { plan: string; messageLimit?: number }) => subject.messageLimit ?? getPlan(subject.plan).monthlyMessages;

export type AccessState = "active" | "paused" | "trial" | "trial_ended" | "company_inactive";

/** Works for a bot, or a company ({ trialEndsAt, companyStatus }). */
export function accessState(
  subject: { status?: "active" | "paused"; trialEndsAt?: string; companyStatus?: "active" | "inactive" },
  now = new Date(),
): AccessState {
  if (subject.companyStatus === "inactive") return "company_inactive";
  if (subject.status === "paused") return "paused";
  if (!subject.trialEndsAt) return "active";
  return Date.parse(subject.trialEndsAt) < now.getTime() ? "trial_ended" : "trial";
}

export interface Allowance {
  allowed: boolean;
  reason?: "paused" | "trial_ended" | "limit" | "company_inactive";
  used: number;
  limit: number | null;
}

export async function checkAllowance(bot: Bot): Promise<Allowance> {
  const limit = effectiveLimit(bot);
  const { messages: used } = await getLimitUsage(bot);
  const state = accessState(bot);
  if (state === "paused" || state === "trial_ended" || state === "company_inactive") return { allowed: false, reason: state, used, limit };
  if (limit !== null && used >= limit) return { allowed: false, reason: "limit", used, limit };
  return { allowed: true, used, limit };
}

export async function recordMessage(botId: string, tokens: { inputTokens: number; outputTokens: number }) {
  const sql = await db();
  await sql.query(
    `INSERT INTO usage_monthly (bot_id, month, messages, input_tokens, output_tokens) VALUES ($1, $2, 1, $3, $4)
     ON CONFLICT (bot_id, month) DO UPDATE SET
       messages = usage_monthly.messages + 1,
       input_tokens = usage_monthly.input_tokens + EXCLUDED.input_tokens,
       output_tokens = usage_monthly.output_tokens + EXCLUDED.output_tokens`,
    [botId, currentMonth(), Math.round(tokens.inputTokens), Math.round(tokens.outputTokens)],
  );
}

export async function recordBlocked(botId: string) {
  const sql = await db();
  await sql.query(
    `INSERT INTO usage_monthly (bot_id, month, blocked) VALUES ($1, $2, 1)
     ON CONFLICT (bot_id, month) DO UPDATE SET blocked = usage_monthly.blocked + 1`,
    [botId, currentMonth()],
  );
}
