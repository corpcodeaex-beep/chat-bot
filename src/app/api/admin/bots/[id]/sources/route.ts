import { NextResponse } from "next/server";
import { errorResponse, HttpError } from "@/lib/errors";
import { getPlan } from "@/lib/plans";
import { crawlWebsite } from "@/lib/rag/crawl";
import { extractFile } from "@/lib/rag/extract";
import { ingest } from "@/lib/rag/ingest";
import { listSources } from "@/lib/rag/store";
import type { KnowledgeSource } from "@/lib/rag/types";
import { requireBot } from "@/lib/session";
import type { Bot } from "@/lib/types";

const MAX_FILE_BYTES = 15 * 1024 * 1024;
const MAX_PAGES = 50;

export async function GET(_request: Request, ctx: RouteContext<"/api/admin/bots/[id]/sources">) {
  try {
    const { id } = await ctx.params;
    await requireBot(id);
    return NextResponse.json({ sources: await listSources(id) });
  } catch (error) {
    return errorResponse(error);
  }
}

/** Plan limit on imported sources (replacing an existing source is always allowed). */
async function assertRoom(bot: Bot, replaces: (s: KnowledgeSource) => boolean) {
  const plan = getPlan(bot.plan);
  if (plan.maxSources === null) return;
  const existing = await listSources(bot.id);
  if (!existing.some(replaces) && existing.length >= plan.maxSources) {
    throw new HttpError(403, `The ${plan.label} plan allows up to ${plan.maxSources} knowledge sources. Remove one or upgrade the plan.`);
  }
}

/**
 * Adds knowledge to a bot. Accepts either:
 * - multipart form with a `file` (PDF, DOCX, TXT, MD, CSV)
 * - JSON { type: "website", url, maxPages }
 * - JSON { type: "text", name, text }
 */
export async function POST(request: Request, ctx: RouteContext<"/api/admin/bots/[id]/sources">) {
  try {
    const { id } = await ctx.params;
    const { bot } = await requireBot(id);

    if ((request.headers.get("content-type") ?? "").includes("multipart/form-data")) {
      const file = (await request.formData()).get("file");
      if (!(file instanceof File)) throw new HttpError(400, "No file uploaded");
      if (file.size > MAX_FILE_BYTES) throw new HttpError(400, "File is larger than 15 MB");
      const replaces = (s: KnowledgeSource) => s.type === "file" && s.name === file.name;
      await assertRoom(bot, replaces);

      const doc = await extractFile(file.name, Buffer.from(await file.arrayBuffer()));
      const source = await ingest(
        id,
        { type: "file", name: file.name, pages: doc.pages, warning: doc.warning },
        [{ heading: file.name.replace(/\.[^.]+$/, ""), text: doc.text }],
        replaces,
      );
      return NextResponse.json({ source }, { status: 201 });
    }

    const body = await request.json().catch(() => null);

    if (body?.type === "website") {
      let url: URL;
      try {
        url = new URL(/^https?:\/\//i.test(body.url) ? body.url : `https://${body.url}`);
      } catch {
        throw new HttpError(400, "Enter a valid website address");
      }
      const replaces = (s: KnowledgeSource) => s.type === "website" && s.name === url.hostname;
      await assertRoom(bot, replaces);

      const maxPages = Math.min(Math.max(Number(body.maxPages) || 15, 1), MAX_PAGES);
      const result = await crawlWebsite(url.toString(), maxPages);
      if (!result.pages.length) {
        const reason = result.errors[0] ?? "no readable text (the site may need JavaScript to show content)";
        throw new HttpError(422, `Could not read the website: ${reason}`);
      }
      const sections = result.pages.map((p) => ({ heading: `${p.title} (${p.url})`, text: p.text }));
      if (result.siteWide) sections.unshift({ heading: `${url.hostname}: site-wide info (menu, footer, contact)`, text: result.siteWide });
      const thin = result.pages.reduce((n, p) => n + p.text.length, 0) < result.pages.length * 200;
      const source = await ingest(
        id,
        {
          type: "website",
          name: url.hostname,
          url: url.toString(),
          pages: result.pages.length,
          warning: thin ? "Very little text was found. The site may load its content with JavaScript." : undefined,
        },
        sections,
        replaces,
      );
      return NextResponse.json({ source, skipped: result.errors.length }, { status: 201 });
    }

    if (body?.type === "text") {
      const name = String(body.name ?? "").trim().slice(0, 120) || "Pasted text";
      const text = String(body.text ?? "");
      if (text.trim().length < 20) throw new HttpError(400, "Text is too short");
      if (text.length > 500_000) throw new HttpError(400, "Text is too long");
      const replaces = (s: KnowledgeSource) => s.type === "text" && s.name === name;
      await assertRoom(bot, replaces);
      const source = await ingest(id, { type: "text", name }, [{ heading: name, text }], replaces);
      return NextResponse.json({ source }, { status: 201 });
    }

    throw new HttpError(400, "Unknown source type");
  } catch (error) {
    if (error instanceof HttpError) return errorResponse(error);
    console.error("[sources]", error);
    return NextResponse.json({ error: (error as Error).message || "Could not import this source" }, { status: 422 });
  }
}
