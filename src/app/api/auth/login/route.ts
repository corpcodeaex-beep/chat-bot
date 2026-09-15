import { NextResponse } from "next/server";
import { adminEmail, adminPassword, createSessionToken, SESSION_COOKIE, sessionCookieOptions, type Session } from "@/lib/auth";
import { getClientLogin } from "@/lib/clients";
import { hashPassword, safeEqual, verifyPassword } from "@/lib/crypto";

const ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

function tooManyAttempts(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > ATTEMPTS;
}

// Used to spend the same time on unknown emails as on real ones.
let dummyHash: Promise<string> | null = null;

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooManyAttempts(ip)) return NextResponse.json({ error: "Too many attempts. Try again in 10 minutes." }, { status: 429 });

  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  let session: Session | null = null;
  if (email === adminEmail()) {
    if (safeEqual(password, adminPassword())) session = { role: "admin" };
  } else if (email) {
    const client = await getClientLogin(email);
    if (client) {
      if (await verifyPassword(password, client.passwordHash)) {
        if (client.status !== "active") {
          return NextResponse.json({ error: "This account is inactive. Please contact your provider." }, { status: 403 });
        }
        session = { role: "client", clientId: client.id, version: client.sessionVersion };
      }
    } else {
      dummyHash ??= hashPassword("not-a-real-password");
      await verifyPassword(password, await dummyHash);
    }
  }

  if (!session) return NextResponse.json({ error: "Wrong email or password" }, { status: 401 });
  const response = NextResponse.json({ ok: true, role: session.role });
  response.cookies.set(SESSION_COOKIE, createSessionToken(session), sessionCookieOptions);
  return response;
}
