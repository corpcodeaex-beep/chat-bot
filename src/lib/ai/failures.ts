import { db } from "../sql";

// AI provider failures (quota used up, outage, bad key) are saved so the admin sees them,
// even though the customer was answered by a fallback.

export interface AiFailureSummary {
  provider: string;
  message: string;
  at: string;
  last24h: number;
}

export async function recordAiFailure(provider: string, message: string) {
  const sql = await db();
  await sql.query("INSERT INTO ai_failures (provider, message) VALUES ($1, $2)", [provider, message.slice(0, 500)]);
  await sql.query("DELETE FROM ai_failures WHERE created_at < now() - interval '30 days'");
}

export async function getRecentAiFailure(): Promise<AiFailureSummary | null> {
  const sql = await db();
  const [row] = await sql.query(
    `SELECT provider, message, created_at,
       (SELECT count(*) FROM ai_failures WHERE created_at > now() - interval '24 hours')::int AS last_24h
     FROM ai_failures WHERE created_at > now() - interval '24 hours'
     ORDER BY created_at DESC LIMIT 1`,
  );
  if (!row) return null;
  return {
    provider: String(row.provider),
    message: String(row.message),
    at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    last24h: Number(row.last_24h),
  };
}
