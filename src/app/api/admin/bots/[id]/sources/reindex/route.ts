import { NextResponse } from "next/server";
import { errorResponse, HttpError } from "@/lib/errors";
import { reindex } from "@/lib/rag/ingest";
import { requireBot } from "@/lib/session";

/** Prepares smart (meaning) search for chunks imported before a Gemini key was added. */
export async function POST(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/sources/reindex">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id, { privateData: true });
    return NextResponse.json(await reindex(id));
  } catch (error) {
    if (error instanceof HttpError) return errorResponse(error);
    return NextResponse.json({ error: (error as Error).message }, { status: 422 });
  }
}
