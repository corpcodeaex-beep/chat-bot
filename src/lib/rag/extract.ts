import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import mammoth from "mammoth";
import { extractText, getDocumentProxy } from "unpdf";
import { cleanText } from "./chunk";

export interface ExtractedDocument {
  text: string;
  pages?: number;
  warning?: string;
}

export const SUPPORTED_FILES = [".pdf", ".docx", ".txt", ".md", ".csv"];

const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "main", "header", "footer", "aside", "nav", "ul", "ol", "table", "thead", "tbody",
  "blockquote", "pre", "address", "figure", "figcaption", "dl", "dt", "dd", "form", "fieldset", "hr",
]);
const SKIP_TAGS = new Set(["script", "style", "noscript", "svg", "iframe", "template", "canvas", "video", "audio", "button", "select", "input"]);

/** Turns HTML into readable plain text, keeping headings, list items and table rows. */
export function htmlToText(nodes: AnyNode[]): string {
  let out = "";
  const walk = (node: AnyNode) => {
    if (node.type === "text") {
      out += node.data.replace(/\s+/g, " ");
      return;
    }
    if (node.type !== "tag") return;
    const tag = node.name.toLowerCase();
    if (SKIP_TAGS.has(tag)) return;
    if (/^h[1-6]$/.test(tag)) out += `\n\n${"#".repeat(Number(tag[1]))} `;
    else if (tag === "li") out += "\n- ";
    else if (tag === "tr") out += "\n";
    else if (tag === "br") out += "\n";
    else if (BLOCK_TAGS.has(tag)) out += "\n\n";
    node.children.forEach((child, i) => {
      if ((tag === "tr") && i > 0 && child.type === "tag") out += " | ";
      walk(child);
    });
    if (/^h[1-6]$/.test(tag) || BLOCK_TAGS.has(tag)) out += "\n\n";
  };
  nodes.forEach(walk);
  return cleanText(out.replace(/\n +/g, "\n").replace(/ +\n/g, "\n"));
}

export interface ExtractedPage {
  title: string;
  text: string;
  links: string[];
}

export function extractHtml(html: string, pageUrl: string): ExtractedPage {
  const $ = cheerio.load(html);
  const title = ($("title").first().text() || $("h1").first().text() || pageUrl).replace(/\s+/g, " ").trim().slice(0, 200);
  const description = $('meta[name="description"]').attr("content")?.trim();

  const links = $("a[href]")
    .map((_, el) => {
      try {
        return new URL($(el).attr("href")!, pageUrl).toString();
      } catch {
        return null;
      }
    })
    .get()
    .filter((l): l is string => !!l);

  // Prefer the main content, but keep the footer: it usually has address, phone and timings.
  const main = $("main, [role=main]").first();
  const roots = main.length ? [...main.toArray(), ...$("footer").toArray()] : $("body").toArray();
  const text = htmlToText(roots);
  return { title, text: description && !text.includes(description) ? `${description}\n\n${text}` : text, links };
}

export async function extractFile(fileName: string, buffer: Buffer): Promise<ExtractedDocument> {
  const ext = fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] ?? "";

  if (ext === ".pdf") {
    const pdf = await getDocumentProxy(new Uint8Array(buffer));
    const { totalPages, text } = await extractText(pdf, { mergePages: false });
    const joined = cleanText(text.join("\n\n"));
    const warning =
      joined.length < totalPages * 40
        ? "Very little text was found. If this PDF is scanned images, convert it with OCR (e.g. in Google Drive choose 'Open with Google Docs') and upload again."
        : undefined;
    return { text: joined, pages: totalPages, warning };
  }

  if (ext === ".docx") {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return { text: htmlToText(cheerio.load(html)("body").toArray()) };
  }

  if (ext === ".doc") {
    throw new Error("Old Word .doc files are not supported. Open it in Word and save as .docx or PDF, then upload again.");
  }

  if ([".txt", ".md", ".csv"].includes(ext)) {
    return { text: cleanText(buffer.toString("utf8").replace(/^﻿/, "")) };
  }

  throw new Error(`Unsupported file type. Upload ${SUPPORTED_FILES.join(", ")}`);
}
