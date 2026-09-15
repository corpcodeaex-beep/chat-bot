import { NextResponse } from "next/server";
import { getClient } from "@/lib/clients";
import { getBot, updateBotPlan } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";
import { cleanPlanInput } from "@/lib/validate";

/** Plan, status, trial, message limit and client owner (admin only). */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/bots/[id]/plan">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    if (!(await getBot(id))) throw new HttpError(404, "Bot not found");
    const input = cleanPlanInput(await request.json().catch(() => null));
    if (input.clientId && !(await getClient(input.clientId))) throw new HttpError(400, "Client not found");
    return NextResponse.json({ bot: await updateBotPlan(id, input) });
  } catch (error) {
    return errorResponse(error);
  }
}
