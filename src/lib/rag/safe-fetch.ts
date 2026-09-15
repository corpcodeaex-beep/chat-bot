import { lookup } from "dns/promises";
import net from "net";

// Fetches public web pages only. Blocks localhost and private network addresses
// (including after redirects) so the website importer can't be used to reach
// internal services.

const MAX_REDIRECTS = 5;

function isPrivateAddress(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return v6 === "::" || v6 === "::1" || v6.startsWith("fc") || v6.startsWith("fd") || v6.startsWith("fe80");
}

async function assertPublic(url: URL) {
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("Only http and https links are supported");
  if (url.username || url.password) throw new Error("Links with passwords are not supported");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    throw new Error("Local addresses are not allowed");
  }
  const addresses = net.isIP(host) ? [{ address: host }] : await lookup(host, { all: true });
  if (!addresses.length || addresses.some((a) => isPrivateAddress(a.address))) {
    throw new Error("Private network addresses are not allowed");
  }
}

export interface FetchedPage {
  url: string;
  contentType: string;
  body: Buffer;
}

export async function safeFetch(rawUrl: string, { maxBytes = 3_000_000, timeoutMs = 15_000 } = {}): Promise<FetchedPage> {
  let url = new URL(rawUrl);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      await assertPublic(url);
      const res = await fetch(url, {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; ChatDeskBot/1.0; knowledge import)", Accept: "text/html,*/*" },
      });
      if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
        url = new URL(res.headers.get("location")!, url);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const declared = Number(res.headers.get("content-length") ?? 0);
      if (declared > maxBytes) throw new Error("Page is too large");

      const reader = res.body?.getReader();
      const parts: Uint8Array[] = [];
      let size = 0;
      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          throw new Error("Page is too large");
        }
        parts.push(value);
      }
      return { url: url.toString(), contentType: res.headers.get("content-type") ?? "", body: Buffer.concat(parts) };
    }
    throw new Error("Too many redirects");
  } catch (error) {
    if ((error as Error).name === "AbortError") throw new Error("The website took too long to respond");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}
