import { randomUUID } from "crypto";
import { db, iso, opt, type Row } from "./sql";
import type { Bot, BotContent, BotPlanSettings, ChatMessage, Conversation, Lead, SkillKey } from "./types";
import { currentMonth } from "./usage";

// All app data (bots, conversations, leads) lives in Postgres.

export const newId = () => randomUUID().replace(/-/g, "").slice(0, 16);

// ---- Bots ----

// Company bots take plan, trial and reply limit from their company; demo bots use their own columns.
const BOT_SELECT = `SELECT b.*, c.status AS company_status, c.plan AS company_plan,
  c.trial_ends_at AS company_trial_ends_at, c.message_limit AS company_message_limit
  FROM bots b LEFT JOIN clients c ON c.id = b.client_id`;

const optionalNumber = (value: unknown) => (value === null || value === undefined ? undefined : Number(value));

const toBot = (r: Row): Bot => {
  const hasCompany = r.company_status !== null && r.company_status !== undefined;
  const trial = hasCompany ? r.company_trial_ends_at : r.trial_ends_at;
  return {
    id: String(r.id),
    name: String(r.name),
    businessName: String(r.business_name),
    template: String(r.template),
    color: String(r.color),
    welcome: String(r.welcome),
    instructions: String(r.instructions),
    knowledge: String(r.knowledge),
    skills: r.skills as Record<SkillKey, boolean>,
    language: r.language as Bot["language"],
    clientId: opt(r.client_id),
    plan: String((hasCompany ? r.company_plan : r.plan) ?? "standard"),
    status: r.status === "paused" ? "paused" : "active",
    trialEndsAt: trial ? iso(trial) : undefined,
    messageLimit: optionalNumber(hasCompany ? r.company_message_limit : r.message_limit),
    companyStatus: hasCompany ? (r.company_status === "inactive" ? "inactive" : "active") : undefined,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
};

const CONTENT_COLUMNS = {
  name: "name",
  businessName: "business_name",
  template: "template",
  color: "color",
  welcome: "welcome",
  instructions: "instructions",
  knowledge: "knowledge",
  skills: "skills",
  language: "language",
} as const;

const PLAN_COLUMNS = {
  clientId: "client_id",
  plan: "plan",
  status: "status",
  trialEndsAt: "trial_ends_at",
  messageLimit: "message_limit",
} as const;

/** All bots, or only one company's bots. */
export async function listBots(clientId?: string) {
  const sql = await db();
  const rows = clientId
    ? await sql.query(`${BOT_SELECT} WHERE b.client_id = $1 ORDER BY b.created_at DESC`, [clientId])
    : await sql.query(`${BOT_SELECT} ORDER BY b.created_at DESC`);
  return rows.map(toBot);
}

export async function getBot(id: string) {
  const sql = await db();
  const [row] = await sql.query(`${BOT_SELECT} WHERE b.id = $1`, [id]);
  return row ? toBot(row) : null;
}

export async function countBots(clientId: string) {
  const sql = await db();
  const [row] = await sql.query("SELECT count(*)::int AS n FROM bots WHERE client_id = $1", [clientId]);
  return Number(row?.n ?? 0);
}

export async function createBot(input: BotContent & Partial<BotPlanSettings>) {
  const sql = await db();
  const id = newId();
  await sql.query(
    `INSERT INTO bots (id, name, business_name, template, color, welcome, instructions, knowledge, skills, language, client_id, plan, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [
      id,
      input.name,
      input.businessName,
      input.template,
      input.color,
      input.welcome,
      input.instructions,
      input.knowledge,
      JSON.stringify(input.skills),
      input.language,
      input.clientId ?? null,
      input.plan ?? "standard",
      input.status ?? "active",
    ],
  );
  return (await getBot(id))!;
}

async function updateColumns(id: string, columns: Record<string, string>, patch: Record<string, unknown>) {
  const sql = await db();
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(columns)) {
    if (patch[key] === undefined) continue;
    values.push(key === "skills" ? JSON.stringify(patch[key]) : patch[key]);
    sets.push(`${column} = $${values.length}`);
  }
  if (sets.length) {
    values.push(id);
    await sql.query(`UPDATE bots SET ${sets.join(", ")}, updated_at = now() WHERE id = $${values.length}`, values);
  }
  return getBot(id);
}

/** Setup-tab fields (admin or the owning company). */
export const updateBot = (id: string, patch: Partial<BotContent>) => updateColumns(id, CONTENT_COLUMNS, patch);

/**
 * Owner, pause status, and (for demo bots only) plan, trial and limit. Admin only.
 * `null` clears a value. For company bots the company's plan settings apply instead.
 */
export const updateBotPlan = (
  id: string,
  patch: { clientId?: string | null; plan?: string; status?: string; trialEndsAt?: string | null; messageLimit?: number | null },
) => updateColumns(id, PLAN_COLUMNS, patch);

/** Also removes the bot's conversations, leads, knowledge, usage and WhatsApp link (ON DELETE CASCADE). */
export async function deleteBot(id: string) {
  const sql = await db();
  return (await sql.query("DELETE FROM bots WHERE id = $1 RETURNING id", [id])).length > 0;
}

// ---- Conversations ----

const toConversation = (r: Row): Conversation => ({
  id: String(r.id),
  botId: String(r.bot_id),
  channel: r.channel === "whatsapp" ? "whatsapp" : "web",
  contact: opt(r.contact),
  messages: r.messages as ChatMessage[],
  needsHuman: Boolean(r.needs_human),
  pageUrl: opt(r.page_url),
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

export async function getConversation(id: string) {
  const sql = await db();
  const [row] = await sql.query("SELECT * FROM conversations WHERE id = $1", [id]);
  return row ? toConversation(row) : null;
}

export async function saveConversation(conv: Omit<Conversation, "createdAt" | "updatedAt"> & { createdAt?: string }) {
  const sql = await db();
  const [row] = await sql.query(
    `INSERT INTO conversations (id, bot_id, channel, contact, messages, needs_human, page_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO UPDATE SET
       messages = EXCLUDED.messages,
       needs_human = EXCLUDED.needs_human,
       contact = COALESCE(conversations.contact, EXCLUDED.contact),
       page_url = COALESCE(conversations.page_url, EXCLUDED.page_url),
       updated_at = now()
     RETURNING *`,
    [conv.id, conv.botId, conv.channel, conv.contact ?? null, JSON.stringify(conv.messages), conv.needsHuman, conv.pageUrl ?? null],
  );
  return toConversation(row);
}

export async function listConversations(botId: string, limit = 100) {
  const sql = await db();
  return (
    await sql.query("SELECT * FROM conversations WHERE bot_id = $1 ORDER BY updated_at DESC LIMIT $2", [botId, limit])
  ).map(toConversation);
}

// ---- Leads ----

const LEAD_FIELDS = ["name", "phone", "email", "need", "time"] as const;

const toLead = (r: Row): Lead => ({
  id: String(r.id),
  botId: String(r.bot_id),
  conversationId: String(r.conversation_id),
  name: opt(r.name),
  phone: opt(r.phone),
  email: opt(r.email),
  need: opt(r.need),
  time: opt(r.time),
  createdAt: iso(r.created_at),
  updatedAt: iso(r.updated_at),
});

/**
 * One lead per conversation; new details are merged into it.
 * With keepExisting, values already saved win (e.g. a typed name over a WhatsApp profile name).
 */
export async function upsertLead(botId: string, conversationId: string, data: Partial<Lead>, { keepExisting = false } = {}) {
  const sql = await db();
  const values = LEAD_FIELDS.map((f) => (typeof data[f] === "string" && data[f]!.trim() ? data[f]!.trim() : null));
  const merge = LEAD_FIELDS.map((f) =>
    keepExisting ? `${f} = COALESCE(leads.${f}, EXCLUDED.${f})` : `${f} = COALESCE(EXCLUDED.${f}, leads.${f})`,
  ).join(", ");
  const [row] = await sql.query(
    `INSERT INTO leads (id, bot_id, conversation_id, name, phone, email, need, time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT (conversation_id) DO UPDATE SET ${merge}, updated_at = now()
     RETURNING *`,
    [newId(), botId, conversationId, ...values],
  );
  return toLead(row);
}

/** Leads for one bot, for one company's bots, or all. */
export async function listLeads(botId?: string, limit = 1000, clientId?: string) {
  const sql = await db();
  const rows = botId
    ? await sql.query("SELECT * FROM leads WHERE bot_id = $1 ORDER BY created_at DESC LIMIT $2", [botId, limit])
    : clientId
      ? await sql.query(
          "SELECT l.* FROM leads l JOIN bots b ON b.id = l.bot_id WHERE b.client_id = $1 ORDER BY l.created_at DESC LIMIT $2",
          [clientId, limit],
        )
      : await sql.query("SELECT * FROM leads ORDER BY created_at DESC LIMIT $1", [limit]);
  return rows.map(toLead);
}

/** Dashboard numbers for all bots, or only one company's bots. */
export async function getStats(clientId?: string) {
  const sql = await db();
  const owner = "($1::text IS NULL OR b.client_id = $1)";
  const params = [clientId ?? null];
  const [[totals], perBot] = await Promise.all([
    sql.query(
      `SELECT
        (SELECT count(*) FROM bots b WHERE ${owner})::int AS bots,
        (SELECT count(*) FROM conversations c JOIN bots b ON b.id = c.bot_id WHERE ${owner})::int AS conversations,
        (SELECT count(*) FROM leads l JOIN bots b ON b.id = l.bot_id WHERE ${owner})::int AS leads,
        (SELECT count(*) FROM leads l JOIN bots b ON b.id = l.bot_id WHERE ${owner} AND l.created_at > now() - interval '7 days')::int AS leads_this_week,
        (SELECT count(*) FROM conversations c JOIN bots b ON b.id = c.bot_id WHERE ${owner} AND c.needs_human)::int AS needs_human`,
      params,
    ),
    sql.query(
      `SELECT b.id,
        (SELECT count(*) FROM conversations c WHERE c.bot_id = b.id)::int AS conversations,
        (SELECT count(*) FROM leads l WHERE l.bot_id = b.id)::int AS leads,
        COALESCE((SELECT u.messages FROM usage_monthly u WHERE u.bot_id = b.id AND u.month = $2), 0)::int AS messages_this_month,
        CASE WHEN b.client_id IS NULL
          THEN COALESCE((SELECT u.messages FROM usage_monthly u WHERE u.bot_id = b.id AND u.month = $2), 0)
          ELSE COALESCE((SELECT sum(u.messages) FROM usage_monthly u JOIN bots b2 ON b2.id = u.bot_id WHERE b2.client_id = b.client_id AND u.month = $2), 0)
        END::int AS limit_used
       FROM bots b WHERE ${owner}`,
      [...params, currentMonth()],
    ),
  ]);
  return {
    bots: Number(totals.bots),
    conversations: Number(totals.conversations),
    leads: Number(totals.leads),
    leadsThisWeek: Number(totals.leads_this_week),
    needsHuman: Number(totals.needs_human),
    perBot: Object.fromEntries(
      perBot.map((r) => [
        String(r.id),
        {
          conversations: Number(r.conversations),
          leads: Number(r.leads),
          messagesThisMonth: Number(r.messages_this_month),
          /** Replies counted against the limit: the whole company's total for company bots. */
          limitUsed: Number(r.limit_used),
        },
      ]),
    ),
  };
}
