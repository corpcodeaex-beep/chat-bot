import { NextResponse } from "next/server";
import { deleteClient, getClient, getCompany, setClientPassword, updateClient } from "@/lib/clients";
import { randomPassword } from "@/lib/crypto";
import { errorResponse, HttpError, ValidationError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";
import { cleanEmail, cleanName, cleanPassword, cleanPlanInput } from "@/lib/validate";

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/clients/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    const company = await getCompany(id);
    if (!company) throw new HttpError(404, "Company not found");
    return NextResponse.json({ company });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Updates a company. Any of:
 * - name, email
 * - status: "active" | "inactive"
 * - plan, trialEndsAt ("YYYY-MM-DD" or "" to clear), messageLimit (number or "" to use the plan's)
 * - password (set this exact password) or resetPassword: true (generate one)
 */
export async function PATCH(request: Request, ctx: RouteContext<"/api/admin/clients/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    if (!(await getClient(id))) throw new HttpError(404, "Company not found");
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") throw new ValidationError("Invalid request body");
    if (body.status !== undefined && body.status !== "active" && body.status !== "inactive") {
      throw new ValidationError("Status must be active or inactive");
    }
    const billing = cleanPlanInput({ plan: body.plan, trialEndsAt: body.trialEndsAt, messageLimit: body.messageLimit });

    await updateClient(id, {
      name: body.name !== undefined ? cleanName(body.name) : undefined,
      email: body.email !== undefined ? cleanEmail(body.email) : undefined,
      status: body.status,
      plan: billing.plan,
      trialEndsAt: billing.trialEndsAt,
      messageLimit: billing.messageLimit,
    });

    let password: string | undefined;
    if (body.password || body.resetPassword) {
      password = body.password ? cleanPassword(body.password) : randomPassword();
      await setClientPassword(id, password);
    }
    return NextResponse.json({ company: await getCompany(id), password });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/admin/clients/[id]">) {
  try {
    const { id } = await ctx.params;
    await requireAdmin();
    return (await deleteClient(id)) ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Company not found" }, { status: 404 });
  } catch (error) {
    return errorResponse(error);
  }
}
