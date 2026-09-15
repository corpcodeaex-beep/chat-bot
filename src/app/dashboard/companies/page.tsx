import { headers } from "next/headers";
import CompaniesManager from "./CompaniesManager";
import { listCompanies } from "@/lib/clients";
import { pageAdmin } from "@/lib/session";
import { TEMPLATES } from "@/lib/templates";
import { appUrlFromHeaders } from "@/lib/url";

export default async function CompaniesPage({ searchParams }: PageProps<"/dashboard/companies">) {
  await pageAdmin();
  const [companies, h, { new: openNew }] = await Promise.all([listCompanies(), headers(), searchParams]);
  return (
    <CompaniesManager
      companies={companies}
      loginUrl={`${appUrlFromHeaders(h)}/login`}
      templates={TEMPLATES.map((t) => ({ key: t.key, label: t.label }))}
      startWithForm={openNew === "1"}
    />
  );
}
