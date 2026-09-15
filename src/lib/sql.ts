import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { SCHEMA } from "./schema";

// Postgres connection (Neon's HTTP driver works locally and on serverless hosts).

export type Row = Record<string, unknown>;

export interface Db {
  query(text: string, params?: unknown[]): Promise<Row[]>;
}

// Errors where the connection was never opened, so the query never ran and retrying is safe.
const CONNECT_ERRORS = new Set(["UND_ERR_CONNECT_TIMEOUT", "ECONNREFUSED", "ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT"]);
const RETRIES = 2;

function isConnectError(error: unknown): boolean {
  for (let e = error as { cause?: unknown; sourceError?: unknown; code?: string } | undefined, depth = 0; e && depth < 5; depth++) {
    if (e.code && CONNECT_ERRORS.has(e.code)) return true;
    e = (e.sourceError ?? e.cause) as typeof e;
  }
  return false;
}

let client: Db | null = null;
let ready: Promise<void> | null = null;

function createClient(url: string): Db {
  const sql: NeonQueryFunction<false, false> = neon(url);
  return {
    async query(text, params) {
      for (let attempt = 0; ; attempt++) {
        try {
          return (await sql.query(text, params)) as Row[];
        } catch (error) {
          if (attempt >= RETRIES || !isConnectError(error)) throw error;
          console.warn(`[db] connection failed, retrying (${attempt + 1}/${RETRIES})`);
          await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        }
      }
    },
  };
}

/** Returns the database client, creating the tables on first use. */
export async function db(): Promise<Db> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set. Add your Postgres connection string to .env.local.");
  client ??= createClient(url);
  const sql = client;
  ready ??= (async () => {
    for (const statement of SCHEMA) await sql.query(statement);
  })().catch((error) => {
    ready = null;
    throw error;
  });
  await ready;
  return sql;
}

export const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : String(value));
export const opt = (value: unknown) => (value === null || value === undefined ? undefined : String(value));
