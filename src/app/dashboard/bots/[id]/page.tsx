import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BotWorkspace from "@/components/BotWorkspace";
import { getClient, listClients } from "@/lib/clients";
import { getBot, listConversations, listLeads } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { embeddingsAvailable } from "@/lib/rag/embed";
import { listSources } from "@/lib/rag/store";
import { pageViewer } from "@/lib/session";
import { appUrlFromHeaders } from "@/lib/url";
import { accessState, effectiveLimit, getCompanyUsageHistory, getLimitUsage, getMonthUsage, getUsageHistory } from "@/lib/usage";
import { getWhatsAppAccount } from "@/lib/whatsapp";

export default async function BotPage({ params }: PageProps<"/dashboard/bots/[id]">) {
  const { id } = await params;
  const viewer = await pageViewer();
  const bot = await getBot(id);
  if (!bot || (viewer.role === "client" && bot.clientId !== viewer.clientId)) notFound();
  const isAdmin = viewer.role === "admin";

  const [leads, conversations, sources, history, current, botUsage, whatsapp, clients, company, h] = await Promise.all([
    listLeads(id),
    listConversations(id),
    listSources(id),
    bot.clientId ? getCompanyUsageHistory(bot.clientId) : getUsageHistory(id),
    getLimitUsage(bot),
    getMonthUsage(id),
    getWhatsAppAccount(id),
    isAdmin ? listClients() : Promise.resolve([]),
    bot.clientId ? getClient(bot.clientId) : Promise.resolve(null),
    headers(),
  ]);
  const appUrl = appUrlFromHeaders(h);
  const plan = getPlan(bot.plan);

  return (
    <BotWorkspace
      bot={bot}
      isAdmin={isAdmin}
      leads={leads}
      conversations={conversations}
      sources={sources}
      smartSearch={embeddingsAvailable()}
      appUrl={appUrl}
      usage={history}
      currentUsage={current}
      botReplies={botUsage.messages}
      limit={effectiveLimit(bot)}
      access={accessState(bot)}
      company={company ? { id: company.id, name: company.name, botCount: company.botCount } : null}
      clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      whatsapp={{
        account: whatsapp,
        planAllows: plan.whatsapp,
        planLabel: plan.label,
        webhookUrl: `${appUrl}/api/whatsapp/webhook`,
        verifyToken: isAdmin ? (process.env.WHATSAPP_VERIFY_TOKEN ?? "") : undefined,
        appSecretSet: !!process.env.WHATSAPP_APP_SECRET,
        dryRun: process.env.WHATSAPP_DRY_RUN === "true",
      }}
    />
  );
}
