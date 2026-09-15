import { NextResponse } from "next/server";
import { deleteBot, updateBot } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { requireBot } from "@/lib/session";
import { cleanBotInput } from "@/lib/validate";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]">) {
  try {
    const { id } = await ctx.params;
    const { bot } = await requireBot(id);
    return NextResponse.json({ bot });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Setup-tab changes (admin or the owning client). */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/bots/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id);
    const bot = await updateBot(id, cleanBotInput(await request.json().catch(() => null)));
    return NextResponse.json({ bot });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Admin, or the company that owns the bot. */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id);
    return (await deleteBot(id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Bot not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
