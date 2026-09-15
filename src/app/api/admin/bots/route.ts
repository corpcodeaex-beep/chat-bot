import { NextResponse } from "next/server";
import { getClient } from "@/lib/clients";
import { createBot, listBots } from "@/lib/db";
import { errorResponse, HttpError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import { requireViewer } from "@/lib/session";
import { getTemplate } from "@/lib/templates";
import { cleanBotInput } from "@/lib/validate";

export async function GET() {
  try {
    const viewer = await requireViewer();
    return NextResponse.json({ bots: await listBots(viewer.role === "client" ? viewer.clientId : undefined) });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * Creates a bot from a template; any fields sent override the template.
 * A company creates bots for itself, up to its plan's bot limit.
 * The admin can create demo bots, or bots for a company with { clientId }.
 */
export async function POST(request: Request) {
  try {
    const viewer = await requireViewer();
    const body = await request.json().catch(() => null);
    const input = cleanBotInput(body);

    let clientId: string | undefined;
    if (viewer.role === "client") {
      const company = await getClient(viewer.clientId);
      if (!company) throw new HttpError(404, "Company not found");
      const plan = getPlan(company.plan);
      if (plan.maxBots !== null && company.botCount >= plan.maxBots) {
        throw new HttpError(
          403,
          `Your ${plan.label} plan allows ${plan.maxBots} ${plan.maxBots === 1 ? "bot" : "bots"}. Contact your provider to upgrade.`,
        );
      }
      clientId = company.id;
    } else if (typeof body?.clientId === "string" && body.clientId) {
      if (!(await getClient(body.clientId))) throw new HttpError(400, "Company not found");
      clientId = body.clientId;
    }

    const t = getTemplate(input.template ?? "general");
    const businessName = input.businessName?.trim() || t.businessName;
    // Put the real business name into the template's sample text.
    const named = (text: string) => text.split(t.businessName).join(businessName);
    const bot = await createBot({
      name: input.name || `${t.label} bot`,
      businessName,
      template: t.key,
      color: input.color ?? t.color,
      welcome: input.welcome ?? named(t.welcome),
      instructions: input.instructions ?? t.instructions,
      knowledge: input.knowledge ?? named(t.knowledge),
      skills: input.skills ?? t.skills,
      language: input.language ?? "auto",
      clientId,
    });
    return NextResponse.json({ bot }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
