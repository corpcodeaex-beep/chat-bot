import { NextResponse } from "next/server";
import { AiError } from "@/lib/ai/types";
import { ChatError, runChat } from "@/lib/engine";

// Public endpoint used by the website widget, so it allows any origin.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const MAX_MESSAGE = 1000;
const RATE_LIMIT = 15; // messages per minute per visitor IP
const hits = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT;
}

function fail(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: CORS });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (rateLimited(ip)) return fail("Too many messages. Please wait a minute.", 429);

  const body = await request.json().catch(() => null);
  const botId = typeof body?.botId === "string" ? body.botId : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!botId || !message) return fail("botId and message are required", 400);
  if (message.length > MAX_MESSAGE) return fail(`Message is too long (max ${MAX_MESSAGE} characters)`, 400);

  try {
    const result = await runChat({
      botId,
      message,
      conversationId: typeof body.conversationId === "string" ? body.conversationId : undefined,
      pageUrl: typeof body.pageUrl === "string" ? body.pageUrl.slice(0, 500) : undefined,
    });
    return NextResponse.json(result, { headers: CORS });
  } catch (error) {
    if (error instanceof ChatError) return fail(error.message, error.status);
    console.error("[chat]", error);
    const status = error instanceof AiError ? error.status : 500;
    return fail("Sorry, I'm having trouble answering right now. Please try again in a moment.", status);
  }
}
