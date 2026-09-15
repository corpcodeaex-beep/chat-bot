import { headers } from "next/headers";
import { notFound } from "next/navigation";
import CompanyDetail from "./CompanyDetail";
import { getCompany } from "@/lib/clients";
import { getStats, listBots } from "@/lib/db";
import { pageAdmin } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";
import { appUrlFromHeaders } from "@/lib/url";
import { accessState, effectiveLimit } from "@/lib/usage";

export default async function CompanyPage({ params }: PageProps<"/dashboard/companies/[id]">) {
  await pageAdmin();
  const { id } = await params;
  const company = await getCompany(id);
  if (!company) notFound();

  const [bots, stats, h] = await Promise.all([listBots(id), getStats(id), headers()]);

  return (
    <CompanyDetail
      company={company}
      access={accessState({ trialEndsAt: company.trialEndsAt, companyStatus: company.status })}
      limit={effectiveLimit(company)}
      loginUrl={`${appUrlFromHeaders(h)}/login`}
      templates={TEMPLATES.map((t) => ({ key: t.key, label: t.label }))}
      bots={bots.map((b) => ({
        id: b.id,
        businessName: b.businessName,
        template: b.template,
        color: b.color,
        access: accessState(b),
        trialEndsAt: b.trialEndsAt,
        replies: stats.perBot[b.id]?.messagesThisMonth ?? 0,
        leads: stats.perBot[b.id]?.leads ?? 0,
      }))}
    />
  );
}
