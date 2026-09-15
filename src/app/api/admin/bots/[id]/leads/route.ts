import { listLeads } from "@/lib/db";
import { errorResponse } from "@/lib/errors";
import { requireBot } from "@/lib/session";

const COLUMNS = ["createdAt", "name", "phone", "email", "need", "time"] as const;

function csvCell(value: string | undefined) {
  const text = value ?? "";
  // Also neutralize spreadsheet formulas (=, +, -, @) typed by customers.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Download a bot's leads as a CSV file (opens in Excel / Google Sheets). */
export async function GET(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/leads">) {
  try {
    const { id } = await ctx.params;
    const { bot } = await requireBot(id, { privateData: true });
    const leads = await listLeads(id);
    const rows = [COLUMNS.join(","), ...leads.map((lead) => COLUMNS.map((c) => csvCell(lead[c])).join(","))];
    const filename = `${bot.businessName.replace(/[^\w-]+/g, "-")}-leads.csv`;
    // BOM so Excel opens Urdu text correctly.
    return new Response(`﻿${rows.join("\r\n")}`, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
