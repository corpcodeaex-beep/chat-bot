import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/lib/password-reset";
import { appUrlFromHeaders } from "@/lib/url";

const ATTEMPTS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  attempts.set(ip, recent);
  if (attempts.size > 5000) attempts.clear();
  return recent.length > ATTEMPTS;
}

/** Always answers the same way, whether or not the email exists. */
export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (tooMany(ip)) return NextResponse.json({ error: "Too many requests. Try again in 10 minutes." }, { status: 429 });

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email && email.length <= 200) {
    await requestPasswordReset(email, appUrlFromHeaders(request.headers)).catch((error) => console.error("[forgot-password]", error));
  }
  return NextResponse.json({ ok: true });
}
