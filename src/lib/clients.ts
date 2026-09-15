import { hashPassword } from "./crypto";
import { newId } from "./db";
import { HttpError, isUniqueViolation } from "./errors";
import { db, iso, type Row } from "./sql";
import { currentMonth } from "./usage";

// Companies: each business has one login, one plan, and sees only its own bots, leads and chats.

export type CompanyStatus = "active" | "inactive";

export interface Client {
  id: string;
  name: string;
  email: string;
  status: CompanyStatus;
  /** Plan shared by all of the company's bots. */
  plan: string;
  trialEndsAt?: string;
  /** Overrides the plan's monthly reply limit. */
  messageLimit?: number;
  sessionVersion: number;
  botCount: number;
  createdAt: string;
}

/** A company with its numbers, for the admin panel. */
export interface CompanySummary extends Client {
  activeBots: number;
  repliesThisMonth: number;
  leadCount: number;
  conversationCount: number;
  /** Files + texts + website pages across the company's bots. */
  documentCount: number;
}

const toClient = (r: Row): Client => ({
  id: String(r.id),
  name: String(r.name),
  email: String(r.email),
  status: r.status === "inactive" ? "inactive" : "active",
  plan: String(r.plan ?? "standard"),
  trialEndsAt: r.trial_ends_at ? iso(r.trial_ends_at) : undefined,
  messageLimit: r.message_limit === null || r.message_limit === undefined ? undefined : Number(r.message_limit),
  sessionVersion: Number(r.session_version),
  botCount: Number(r.bot_count ?? 0),
  createdAt: iso(r.created_at),
});

const toSummary = (r: Row): CompanySummary => ({
  ...toClient(r),
  activeBots: Number(r.active_bots ?? 0),
  repliesThisMonth: Number(r.replies_this_month ?? 0),
  leadCount: Number(r.lead_count ?? 0),
  conversationCount: Number(r.conversation_count ?? 0),
  documentCount: Number(r.document_count ?? 0),
});

const COLUMNS = "c.id, c.name, c.email, c.status, c.plan, c.trial_ends_at, c.message_limit, c.session_version, c.created_at";

const SELECT = `SELECT ${COLUMNS}, (SELECT count(*) FROM bots b WHERE b.client_id = c.id)::int AS bot_count FROM clients c`;

const SUMMARY_SELECT = `SELECT ${COLUMNS},
  (SELECT count(*) FROM bots b WHERE b.client_id = c.id)::int AS bot_count,
  (SELECT count(*) FROM bots b WHERE b.client_id = c.id AND b.status = 'active')::int AS active_bots,
  COALESCE((SELECT sum(u.messages) FROM usage_monthly u JOIN bots b ON b.id = u.bot_id WHERE b.client_id = c.id AND u.month = $1), 0)::int AS replies_this_month,
  (SELECT count(*) FROM leads l JOIN bots b ON b.id = l.bot_id WHERE b.client_id = c.id)::int AS lead_count,
  (SELECT count(*) FROM conversations v JOIN bots b ON b.id = v.bot_id WHERE b.client_id = c.id)::int AS conversation_count,
  COALESCE((SELECT sum(CASE WHEN s.type = 'website' THEN COALESCE(s.pages, 1) ELSE 1 END)
    FROM knowledge_sources s JOIN bots b ON b.id = s.bot_id WHERE b.client_id = c.id), 0)::int AS document_count
  FROM clients c`;

export async function listClients() {
  const sql = await db();
  return (await sql.query(`${SELECT} ORDER BY c.created_at DESC`)).map(toClient);
}

export async function getClient(id: string) {
  const sql = await db();
  const [row] = await sql.query(`${SELECT} WHERE c.id = $1`, [id]);
  return row ? toClient(row) : null;
}

export async function listCompanies() {
  const sql = await db();
  return (await sql.query(`${SUMMARY_SELECT} ORDER BY c.created_at DESC`, [currentMonth()])).map(toSummary);
}

export async function getCompany(id: string) {
  const sql = await db();
  const [row] = await sql.query(`${SUMMARY_SELECT} WHERE c.id = $2`, [currentMonth(), id]);
  return row ? toSummary(row) : null;
}

/** Login lookup (includes the password hash). */
export async function getClientLogin(email: string) {
  const sql = await db();
  const [row] = await sql.query("SELECT id, password_hash, session_version, status FROM clients WHERE email = $1", [email.toLowerCase()]);
  return row
    ? {
        id: String(row.id),
        passwordHash: String(row.password_hash),
        sessionVersion: Number(row.session_version),
        status: (row.status === "inactive" ? "inactive" : "active") as CompanyStatus,
      }
    : null;
}

export async function createClient(input: { name: string; email: string; password: string; plan?: string; trialEndsAt?: string | null }) {
  const sql = await db();
  try {
    const id = newId();
    await sql.query("INSERT INTO clients (id, name, email, password_hash, plan, trial_ends_at) VALUES ($1, $2, $3, $4, $5, $6)", [
      id,
      input.name,
      input.email.toLowerCase(),
      await hashPassword(input.password),
      input.plan ?? "standard",
      input.trialEndsAt ?? null,
    ]);
    return (await getClient(id))!;
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "A company with this email already exists");
    throw error;
  }
}

export interface ClientPatch {
  name?: string;
  email?: string;
  /** Inactive: can't log in and all its bots stop answering. */
  status?: CompanyStatus;
  plan?: string;
  trialEndsAt?: string | null;
  messageLimit?: number | null;
}

export async function updateClient(id: string, patch: ClientPatch) {
  const sql = await db();
  const columns: Record<keyof ClientPatch, string> = {
    name: "name",
    email: "email",
    status: "status",
    plan: "plan",
    trialEndsAt: "trial_ends_at",
    messageLimit: "message_limit",
  };
  const sets: string[] = [];
  const values: unknown[] = [];
  for (const [key, column] of Object.entries(columns) as [keyof ClientPatch, string][]) {
    if (patch[key] === undefined) continue;
    values.push(key === "email" ? String(patch.email).toLowerCase() : patch[key]);
    sets.push(`${column} = $${values.length}`);
  }
  if (!sets.length) return getClient(id);
  values.push(id);
  try {
    await sql.query(`UPDATE clients SET ${sets.join(", ")} WHERE id = $${values.length}`, values);
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "A company with this email already exists");
    throw error;
  }
  return getClient(id);
}

/** Sets a new password and logs the company out everywhere. Returns the new session version. */
export async function setClientPassword(id: string, password: string) {
  const sql = await db();
  const [row] = await sql.query(
    "UPDATE clients SET password_hash = $1, session_version = session_version + 1 WHERE id = $2 RETURNING session_version",
    [await hashPassword(password), id],
  );
  return row ? Number(row.session_version) : null;
}

/** The company's bots are kept and become admin-owned demo bots. */
export async function deleteClient(id: string) {
  const sql = await db();
  return (await sql.query("DELETE FROM clients WHERE id = $1 RETURNING id", [id])).length > 0;
}
