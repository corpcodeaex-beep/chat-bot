import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/errors";
import { removeSource } from "@/lib/rag/store";
import { requireBot } from "@/lib/session";

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/sources/[sourceId]">) {
  try {
    const { id, sourceId } = await ctx.params;
    await requireBot(id);
    return (await removeSource(id, sourceId))
      ? NextResponse.json({ ok: true })
      : NextResponse.json({ error: "Source not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
