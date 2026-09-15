import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { searchKnowledge } from "@/lib/rag/search";
import { requireBot } from "@/lib/session";

/** Lets the dashboard preview which knowledge the bot would use for a question. */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/bots/[id]/search">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id, { privateData: true });
    const body = await request.json().catch(() => null);
    const query = typeof body?.query === "string" ? body.query.slice(0, 500) : "";
    if (!query.trim()) return NextResponse.json({ error: "Type a question" }, { status: 400 });
    return NextResponse.json({ results: await searchKnowledge(id, query) });
  } catch (error) {
    return errorResponse(error);
  }
}
