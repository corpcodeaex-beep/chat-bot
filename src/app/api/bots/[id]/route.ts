import { NextResponse } from "next/server";
import { getBot } from "@/lib/db";

const CORS = { "Access-Control-Allow-Origin": "*" };

/** Public look-and-feel settings for the website widget (no private data). */
export async function GET(_request: Request, ctx: RouteContext<"/api/bots/[id]">) {
  const { id } = await ctx.params;
  const bot = await getBot(id);
  if (!bot) return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: CORS });
  return NextResponse.json(
    { id: bot.id, businessName: bot.businessName, color: bot.color, welcome: bot.welcome },
    { headers: CORS },
  );
}
