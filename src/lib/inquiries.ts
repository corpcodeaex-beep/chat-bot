import { newId } from "./db";
import { db, iso, opt, type Row } from "./sql";

// Demo requests sent from the public website's contact form.

export interface Inquiry {
  id: string;
  name: string;
  business?: string;
  email: string;
  phone?: string;
  industry?: string;
  plan?: string;
  message?: string;
  handled: boolean;
  createdAt: string;
}

const toInquiry = (r: Row): Inquiry => ({
  id: String(r.id),
  name: String(r.name),
  business: opt(r.business),
  email: String(r.email),
  phone: opt(r.phone),
  industry: opt(r.industry),
  plan: opt(r.plan),
  message: opt(r.message),
  handled: Boolean(r.handled),
  createdAt: iso(r.created_at),
});

export async function createInquiry(input: Omit<Inquiry, "id" | "handled" | "createdAt">) {
  const sql = await db();
  const [row] = await sql.query(
    `INSERT INTO site_inquiries (id, name, business, email, phone, industry, plan, message)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [newId(), input.name, input.business || null, input.email, input.phone || null, input.industry || null, input.plan || null, input.message || null],
  );
  return toInquiry(row);
}

export async function listInquiries(limit = 300) {
  const sql = await db();
  return (await sql.query("SELECT * FROM site_inquiries ORDER BY created_at DESC LIMIT $1", [limit])).map(toInquiry);
}

export async function setInquiryHandled(id: string, handled: boolean) {
  const sql = await db();
  return (await sql.query("UPDATE site_inquiries SET handled = $1 WHERE id = $2 RETURNING id", [handled, id])).length > 0;
}

/** Open requests from the last 30 days, for the admin notification. */
export async function getOpenInquiries(): Promise<{ count: number; latestAt: string } | null> {
  const sql = await db();
  const [row] = await sql.query(
    "SELECT count(*)::int AS n, max(created_at) AS latest FROM site_inquiries WHERE handled = false AND created_at > now() - interval '30 days'",
  );
  return row && Number(row.n) > 0 ? { count: Number(row.n), latestAt: iso(row.latest) } : null;
}
