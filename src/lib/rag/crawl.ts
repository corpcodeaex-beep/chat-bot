import { extractHtml } from "./extract";
import { safeFetch } from "./safe-fetch";

export interface CrawledPage {
  url: string;
  title: string;
  text: string;
}

export interface CrawlResult {
  pages: CrawledPage[];
  siteWide: string;
  errors: string[];
}

const SKIP_EXT = /\.(pdf|jpe?g|png|gif|webp|svg|ico|zip|rar|mp4|mp3|avi|mov|docx?|xlsx?|pptx?|css|js|json|xml|woff2?|ttf)(\?|$)/i;
const SKIP_PATH = /\/(wp-admin|wp-login|cart|checkout|my-account|login|signin|signup|register|feed)\b/i;
const CONCURRENCY = 3;

const sameSite = (a: URL, b: URL) => a.hostname.replace(/^www\./, "") === b.hostname.replace(/^www\./, "");

function normalize(link: string): string | null {
  try {
    const url = new URL(link);
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid|gclid)/.test(key)) url.searchParams.delete(key);
    if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString();
  } catch {
    return null;
  }
}

async function sitemapUrls(start: URL): Promise<string[]> {
  try {
    const { body } = await safeFetch(new URL("/sitemap.xml", start).toString(), { maxBytes: 2_000_000, timeoutMs: 8000 });
    const locs = [...body.toString("utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    // A sitemap index points at more sitemaps; read the first few.
    const nested = locs.filter((l) => l.endsWith(".xml")).slice(0, 3);
    const pages = locs.filter((l) => !l.endsWith(".xml"));
    for (const sitemap of nested) {
      try {
        const { body: inner } = await safeFetch(sitemap, { maxBytes: 2_000_000, timeoutMs: 8000 });
        pages.push(...[...inner.toString("utf8").matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]));
      } catch {
        // Ignore broken nested sitemaps.
      }
    }
    return pages;
  } catch {
    return [];
  }
}

/** Reads up to `maxPages` pages of one website, starting at `startUrl`. */
export async function crawlWebsite(startUrl: string, maxPages: number): Promise<CrawlResult> {
  const start = new URL(startUrl);
  const queue: string[] = [normalize(start.toString())!];
  const seen = new Set(queue);
  const enqueue = (link: string) => {
    const n = normalize(link);
    if (!n || seen.has(n)) return;
    const url = new URL(n);
    if (!sameSite(url, start) || SKIP_EXT.test(url.pathname) || SKIP_PATH.test(url.pathname)) return;
    seen.add(n);
    queue.push(n);
  };

  (await sitemapUrls(start)).slice(0, maxPages * 3).forEach(enqueue);

  const pages: CrawledPage[] = [];
  const errors: string[] = [];
  const seenFinalUrls = new Set<string>();

  while (queue.length && pages.length < maxPages) {
    const batch = queue.splice(0, Math.min(CONCURRENCY, maxPages - pages.length));
    await Promise.all(
      batch.map(async (link) => {
        try {
          const page = await safeFetch(link);
          if (!page.contentType.includes("html")) return;
          const finalUrl = normalize(page.url) ?? page.url;
          if (seenFinalUrls.has(finalUrl) || !sameSite(new URL(finalUrl), start)) return;
          seenFinalUrls.add(finalUrl);
          const { title, text, links } = extractHtml(page.body.toString("utf8"), page.url);
          links.forEach(enqueue);
          if (text.length > 50 && pages.length < maxPages) pages.push({ url: finalUrl, title, text });
        } catch (error) {
          errors.push(`${link}: ${(error as Error).message}`);
        }
      }),
    );
  }

  return { ...removeBoilerplate(pages), errors };
}

/**
 * Menus, footers and cookie banners repeat on every page. Keep them once as
 * "site-wide" text (they often hold phone, address and timings) and remove
 * them from individual pages so search results stay focused.
 */
function removeBoilerplate(pages: CrawledPage[]): { pages: CrawledPage[]; siteWide: string } {
  if (pages.length < 3) return { pages, siteWide: "" };
  const counts = new Map<string, number>();
  for (const page of pages) {
    for (const line of new Set(page.text.split("\n").map((l) => l.trim()).filter(Boolean))) {
      counts.set(line, (counts.get(line) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.ceil(pages.length * 0.5));
  const repeated = new Set([...counts].filter(([, n]) => n >= threshold).map(([line]) => line));
  const siteWideLines: string[] = [];
  const cleaned = pages.map((page) => ({
    ...page,
    text: page.text
      .split("\n")
      .filter((line) => {
        const t = line.trim();
        if (!repeated.has(t)) return true;
        if (!siteWideLines.includes(t)) siteWideLines.push(t);
        return false;
      })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
  }));
  return { pages: cleaned.filter((p) => p.text.length > 50), siteWide: siteWideLines.join("\n") };
}
