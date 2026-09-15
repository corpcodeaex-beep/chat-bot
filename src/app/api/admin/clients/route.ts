import { NextResponse } from "next/server";
import { createClient, listCompanies } from "@/lib/clients";
import { randomPassword } from "@/lib/crypto";
import { createBot } from "@/lib/db";
import { errorResponse, ValidationError } from "@/lib/errors";
import { requireAdmin } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";
import { cleanEmail, cleanName, cleanPassword, cleanPlanInput } from "@/lib/validate";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ companies: await listCompanies() });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Creates a company with its plan (and optional trial end date).
 * If no password is given, one is generated and returned once.
 * Optionally also creates the company's first bot: { template }.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json().catch(() => null);
    const name = cleanName(body?.name);
    const email = cleanEmail(body?.email);
    const password = body?.password ? cleanPassword(body.password) : randomPassword();
    const billing = cleanPlanInput({ plan: body?.plan ?? "standard", trialEndsAt: body?.trialEndsAt ?? "" });

    const template = body?.template ? TEMPLATES.find((t) => t.key === body.template) : undefined;
    if (body?.template && !template) throw new ValidationError("Unknown business type");

    const client = await createClient({ name, email, password, plan: billing.plan, trialEndsAt: billing.trialEndsAt });
    const bot = template
      ? await createBot({
          name: `${template.label} bot`,
          businessName: name,
          template: template.key,
          color: template.color,
          welcome: template.welcome.split(template.businessName).join(name),
          instructions: template.instructions,
          knowledge: template.knowledge.split(template.businessName).join(name),
          skills: template.skills,
          language: "auto",
          clientId: client.id,
        })
      : null;
    return NextResponse.json({ client, password, bot }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
