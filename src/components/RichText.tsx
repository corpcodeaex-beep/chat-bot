import type { ReactNode } from "react";

// Renders the light formatting AI replies use (bold, bullet/numbered lists,
// headings) as real formatting, and makes links, emails and phone numbers
// tappable. Builds React elements only, never raw HTML.

const INLINE_RE =
  /(\*\*[^*\n]+?\*\*|__[^_\n]+?__|https?:\/\/[^\s<>()]*[^\s<>().,!?;:'"]|www\.[^\s<>()]*[^\s<>().,!?;:'"]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|\+?\d[\d\s-]{8,16}\d)/g;
const LIST_RE = /^(?:[-*•]|(\d+)[.)])\s+(.*)$/;
const linkClass = "underline underline-offset-2";

/** Removes leftover single-asterisk italics and code backticks. */
const plain = (text: string) =>
  text.replace(/(^|[\s(])\*(?!\s)([^*\n]+?)\*(?=$|[\s.,!?;:)])/g, "$1$2").replace(/`([^`\n]+)`/g, "$1");

function inline(text: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(INLINE_RE)) {
    const token = match[0];
    const start = match.index ?? 0;
    if (start > last) out.push(plain(text.slice(last, start)));
    const k = `${key}-${n++}`;

    if (token.startsWith("**") || token.startsWith("__")) {
      out.push(
        <strong key={k} className="font-semibold">
          {inline(token.slice(2, -2), k)}
        </strong>,
      );
    } else if (/^(https?:\/\/|www\.)/i.test(token)) {
      out.push(
        <a key={k} href={token.startsWith("www.") ? `https://${token}` : token} target="_blank" rel="noopener noreferrer" className={`${linkClass} break-all`}>
          {token}
        </a>,
      );
    } else if (token.includes("@")) {
      out.push(
        <a key={k} href={`mailto:${token}`} className={`${linkClass} break-all`}>
          {token}
        </a>,
      );
    } else {
      const digits = token.replace(/\D/g, "");
      out.push(
        digits.length >= 10 && digits.length <= 13 ? (
          <a key={k} href={`tel:${token.trim().startsWith("+") ? "+" : ""}${digits}`} className={`${linkClass} whitespace-nowrap`}>
            {token}
          </a>
        ) : (
          token
        ),
      );
    }
    last = start + token.length;
  }
  if (last < text.length) out.push(plain(text.slice(last)));
  return out;
}

interface List {
  ordered: boolean;
  items: string[];
}

export default function RichText({ text }: { text: string }) {
  const blocks: ReactNode[] = [];
  const state: { list: List | null } = { list: null };

  const flush = () => {
    const list = state.list;
    if (!list) return;
    const k = `b${blocks.length}`;
    const items = list.items.map((item, j) => <li key={j}>{inline(item, `${k}-${j}`)}</li>);
    blocks.push(
      list.ordered ? (
        <ol key={k} className="list-decimal space-y-1 pl-5">
          {items}
        </ol>
      ) : (
        <ul key={k} className="list-disc space-y-1 pl-5">
          {items}
        </ul>
      ),
    );
    state.list = null;
  };

  for (const raw of text.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trim();
    const item = line.match(LIST_RE);
    if (item) {
      const ordered = item[1] !== undefined;
      if (state.list && state.list.ordered !== ordered) flush();
      state.list ??= { ordered, items: [] };
      state.list.items.push(item[2]);
      continue;
    }
    flush();
    if (!line) continue;
    const k = `b${blocks.length}`;
    const heading = line.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      blocks.push(
        <p key={k} className="font-semibold">
          {inline(heading[1], k)}
        </p>,
      );
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(line)) {
      blocks.push(<hr key={k} className="border-current opacity-20" />);
    } else {
      blocks.push(<p key={k}>{inline(line, k)}</p>);
    }
  }
  flush();

  return <div className="space-y-1.5">{blocks}</div>;
}
