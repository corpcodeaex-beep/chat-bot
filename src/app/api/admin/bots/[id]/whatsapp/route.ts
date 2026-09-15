import { NextResponse } from "next/server";
import { getBot } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errors";
import { requireAdmin, requireBot } from "@/lib/session";
import { deleteWhatsAppAccount, getWhatsAppAccount, saveWhatsAppAccount } from "@/lib/whatsapp";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/whatsapp">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id);
    return NextResponse.json({ account: await getWhatsAppAccount(id) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Connects a WhatsApp number to the bot (admin only). Leave accessToken empty to keep the saved one. */
export async function PUT(request: Request, ctx: RouteContext<"/api/admin/bots/[id]/whatsapp">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    if (!(await getBot(id))) throw new HttpError(404, "Bot not found");
    const body = await request.json().catch(() => null);
    const phoneNumberId = typeof body?.phoneNumberId === "string" ? body.phoneNumberId.trim() : "";
    if (!/^\d{5,30}$/.test(phoneNumberId)) throw new HttpError(400, "Phone number ID must be the long number from Meta (digits only)");
    const displayPhone = typeof body?.displayPhone === "string" ? body.displayPhone.trim().slice(0, 40) : "";
    const accessToken = typeof body?.accessToken === "string" ? body.accessToken.trim().slice(0, 1000) : "";
    const account = await saveWhatsAppAccount(id, { phoneNumberId, displayPhone, accessToken, enabled: body?.enabled !== false });
    return NextResponse.json({ account });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/whatsapp">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    await deleteWhatsAppAccount(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
