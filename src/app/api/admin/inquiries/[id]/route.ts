import { NextResponse } from "next/server";
import { errorResponse, HttpError, ValidationError } from "@/lib/errors";
import { setInquiryHandled } from "@/lib/inquiries";
import { requireAdmin } from "@/lib/session";

/** Mark a website demo request as handled or open again. */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/inquiries/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    const body = await request.json().catch(() => null);
    if (typeof body?.handled !== "boolean") throw new ValidationError("handled must be true or false");
    if (!(await setInquiryHandled(id, body.handled))) throw new HttpError(404, "Request not found");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
}
