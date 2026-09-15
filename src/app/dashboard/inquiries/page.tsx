import InquiriesTable from "./InquiriesTable";
import { listInquiries } from "@/lib/inquiries";
import { INDUSTRIES } from "@/lib/marketing";
import { getPlan } from "@/lib/plans";
import { pageAdmin } from "@/lib/session";

export default async function InquiriesPage() {
  await pageAdmin();
  const inquiries = await listInquiries();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Demo requests</h1>
        <p className="text-sm text-slate-500">
          People who asked for a demo on the website. Contact them, create their company, then mark the request as handled.
        </p>
      </div>
      <InquiriesTable
        inquiries={inquiries.map((i) => ({
          ...i,
          industryName: INDUSTRIES.find((x) => x.slug === i.industry)?.name ?? (i.industry === "other" ? "Other" : undefined),
          planName: i.plan ? getPlan(i.plan).label : undefined,
        }))}
      />
    </div>
  );
}
