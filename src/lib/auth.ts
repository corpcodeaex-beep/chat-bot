import { createHash } from "crypto";
import { safeEqual, sign } from "./crypto";

export const SESSION_COOKIE = "cb_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
export const DEFAULT_PASSWORD = "admin123";

export type Session = { role: "admin" } | { role: "client"; clientId: string; version: number };

export const adminPassword = () => process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD;
export const adminEmail = () => (process.env.ADMIN_EMAIL || "admin").trim().toLowerCase();

// Changing ADMIN_PASSWORD invalidates admin sessions.
const adminFingerprint = () => createHash("sha256").update(adminPassword()).digest("base64url").slice(0, 16);

interface Payload {
  r: "a" | "c";
  c?: string;
  v?: number;
  f?: string;
  exp: number;
}

export function createSessionToken(session: Session) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_MAX_AGE;
  const payload: Payload =
    session.role === "admin" ? { r: "a", f: adminFingerprint(), exp } : { r: "c", c: session.clientId, v: session.version, exp };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

/** Checks the signature and expiry. Client sessions are re-checked against the database in session.ts. */
export function readSessionToken(token: string | undefined): Session | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature || !safeEqual(signature, sign(body))) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    if (typeof p.exp !== "number" || p.exp < Date.now() / 1000) return null;
    if (p.r === "a") return p.f === adminFingerprint() ? { role: "admin" } : null;
    if (p.r === "c" && typeof p.c === "string" && typeof p.v === "number") return { role: "client", clientId: p.c, version: p.v };
  } catch {
    // Malformed token.
  }
  return null;
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
