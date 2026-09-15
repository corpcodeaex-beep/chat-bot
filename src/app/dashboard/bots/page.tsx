import { Plus } from "lucide-react";
import Link from "next/link";
import BotCards from "@/components/BotCards";
import { listClients } from "@/lib/clients";
import { getStats, listBots } from "@/lib/db";
import { getDocumentCounts } from "@/lib/rag/store";
import { pageAdmin } from "@/lib/session";

export default async function AllBotsPage() {
  await pageAdmin();
  const [bots, stats, companies, documents] = await Promise.all([listBots(), getStats(), listClients(), getDocumentCounts()]);
  const companyNames = Object.fromEntries(companies.map((c) => [c.id, c.name]));
  const documentCounts = Object.fromEntries([...documents].map(([id, d]) => [id, d.documents]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">All bots</h1>
          <p className="text-sm text-slate-500">
            Every bot across all companies. Company bots show a summary only; their knowledge, leads and chats are private.
          </p>
        </div>
        <Link href="/dashboard/new" className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" aria-hidden />
          New bot
        </Link>
      </div>
      {bots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">No bots yet.</div>
      ) : (
        <BotCards bots={bots} perBot={stats.perBot} companyNames={companyNames} documentCounts={documentCounts} />
      )}
    </div>
  );
}
