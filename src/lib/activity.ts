import { dateInputValue } from "./format";
import { db } from "./sql";

// Chats and leads per day (Pakistan time) for a company's charts.
// The company's own test chats from the dashboard are not counted.

export interface ActivityDay {
  /** YYYY-MM-DD */
  date: string;
  chats: number;
  leads: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function getCompanyActivity(clientId: string, days = 90): Promise<ActivityDay[]> {
  const sql = await db();
  const since = `${days + 1} days`;
  const [chats, leads] = await Promise.all([
    sql.query(
      `SELECT to_char((v.created_at AT TIME ZONE 'Asia/Karachi')::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
       FROM conversations v JOIN bots b ON b.id = v.bot_id
       WHERE b.client_id = $1 AND v.created_at > now() - $2::interval AND v.page_url IS DISTINCT FROM 'dashboard-test'
       GROUP BY 1`,
      [clientId, since],
    ),
    sql.query(
      `SELECT to_char((l.created_at AT TIME ZONE 'Asia/Karachi')::date, 'YYYY-MM-DD') AS day, count(*)::int AS n
       FROM leads l JOIN bots b ON b.id = l.bot_id JOIN conversations v ON v.id = l.conversation_id
       WHERE b.client_id = $1 AND l.created_at > now() - $2::interval AND v.page_url IS DISTINCT FROM 'dashboard-test'
       GROUP BY 1`,
      [clientId, since],
    ),
  ]);
  const chatsByDay = new Map(chats.map((r) => [String(r.day), Number(r.n)]));
  const leadsByDay = new Map(leads.map((r) => [String(r.day), Number(r.n)]));

  // Every day in the range, oldest first, including days with no activity.
  const today = Date.parse(`${dateInputValue(new Date().toISOString())}T00:00:00Z`);
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today - (days - 1 - i) * DAY_MS).toISOString().slice(0, 10);
    return { date, chats: chatsByDay.get(date) ?? 0, leads: leadsByDay.get(date) ?? 0 };
  });
}
