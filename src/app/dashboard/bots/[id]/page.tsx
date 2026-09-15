import { headers } from "next/headers";
import { notFound } from "next/navigation";
import BotWorkspace from "@/components/BotWorkspace";
import CompanyBotAdminView from "@/components/CompanyBotAdminView";
import type { WhatsAppInfo } from "@/components/WhatsAppPanel";
import { getClient, listClients } from "@/lib/clients";
import { getBot, listConversations, listLeads } from "@/lib/db";
import { getPlan } from "@/lib/plans";
import { embeddingsAvailable } from "@/lib/rag/embed";
import { EMPTY_DOCUMENT_COUNTS, getDocumentCounts, listSources } from "@/lib/rag/store";
import { pageViewer } from "@/lib/session";
import { appUrlFromHeaders } from "@/lib/url";
import {
  accessState,
  effectiveLimit,
  getCompanyUsageHistory,
  getLimitUsage,
  getMonthUsage,
  getUsageHistory,
  type UsageMonth,
} from "@/lib/usage";
import { getWhatsAppAccount } from "@/lib/whatsapp";

export default async function BotPage({ params }: PageProps<"/dashboard/bots/[id]">) {
  const { id } = await params;
  const viewer = await pageViewer();
  const bot = await getBot(id);
  if (!bot || (viewer.role === "client" && bot.clientId !== viewer.clientId)) notFound();
  const isAdmin = viewer.role === "admin";
  const plan = getPlan(bot.plan);
  const appUrl = appUrlFromHeaders(await headers());

  const whatsappInfo = async (): Promise<WhatsAppInfo> => ({
    account: await getWhatsAppAccount(id),
    planAllows: plan.whatsapp,
    planLabel: plan.label,
    webhookUrl: `${appUrl}/api/whatsapp/webhook`,
    verifyToken: isAdmin ? (process.env.WHATSAPP_VERIFY_TOKEN ?? "") : undefined,
    appSecretSet: !!process.env.WHATSAPP_APP_SECRET,
    dryRun: process.env.WHATSAPP_DRY_RUN === "true",
  });

  // Admin viewing a company's bot: summary only. Knowledge, leads and chats are never loaded.
  if (isAdmin && bot.clientId) {
    const [documents, history, current, botUsage, whatsapp, clients, company] = await Promise.all([
      getDocumentCounts([id]),
      getCompanyUsageHistory(bot.clientId),
      getLimitUsage(bot),
      getMonthUsage(id),
      whatsappInfo(),
      listClients(),
      getClient(bot.clientId),
    ]);
    if (!company) notFound();
    return (
      <CompanyBotAdminView
        bot={{ ...bot, instructions: "", knowledge: "" }}
        company={{ id: company.id, name: company.name, botCount: company.botCount }}
        access={accessState(bot)}
        documents={documents.get(id) ?? EMPTY_DOCUMENT_COUNTS}
        botReplies={botUsage.messages}
        usage={history}
        current={current}
        limit={effectiveLimit(bot)}
        clients={clients.map((c) => ({ id: c.id, name: c.name }))}
        whatsapp={whatsapp}
      />
    );
  }

  const [leads, conversations, sources, history, current, botUsage, whatsapp, clients, company] = await Promise.all([
    listLeads(id),
    listConversations(id),
    listSources(id),
    bot.clientId ? getCompanyUsageHistory(bot.clientId) : getUsageHistory(id),
    getLimitUsage(bot),
    getMonthUsage(id),
    whatsappInfo(),
    isAdmin ? listClients() : Promise.resolve([]),
    bot.clientId ? getClient(bot.clientId) : Promise.resolve(null),
  ]);

  // AI token numbers are for the admin only; they are not even sent to company browsers.
  const hideTokens = (u: UsageMonth): UsageMonth => (isAdmin ? u : { ...u, inputTokens: 0, outputTokens: 0 });

  return (
    <BotWorkspace
      bot={bot}
      isAdmin={isAdmin}
      leads={leads}
      conversations={conversations}
      sources={sources}
      smartSearch={embeddingsAvailable()}
      appUrl={appUrl}
      usage={history.map(hideTokens)}
      currentUsage={hideTokens(current)}
      botReplies={botUsage.messages}
      limit={effectiveLimit(bot)}
      access={accessState(bot)}
      company={company ? { id: company.id, name: company.name, botCount: company.botCount } : null}
      clients={clients.map((c) => ({ id: c.id, name: c.name }))}
      whatsapp={whatsapp}
    />
  );
}
