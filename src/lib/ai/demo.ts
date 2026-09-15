import { searchKnowledge, tokenize } from "../rag/search";
import type { AiProvider, AiRequest } from "./types";

// Answers straight from the bot's knowledge (RAG) without any AI model. Used when there is
// no API key, and as the last fallback when the AI fails (e.g. free quota used up), so
// customers still get a useful reply and leads are still collected.

const PHONE_RE = /(\+?92[\s-]?3\d{2}[\s-]?\d{7}|\b03\d{2}[\s-]?\d{7}\b|\+?\d[\d\s-]{8,14}\d)/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const NAME_RE = /(?:my name is|i am|i'm|mera naam|name[:\s]+|naam[:\s]+)\s*([\p{L}]+(?:\s[\p{L}]+)?)/iu;
// Words that follow a name in "mera naam Sara hai" / "I am Ali and..." and are not part of it.
const NAME_FILLER = new Set(["hai", "hain", "hoon", "hun", "and", "my", "number", "phone", "is", "here", "aur", "ka", "ki"]);
const GREETING_RE = /^(hi|hello|hey|salam|salaam|aoa|assalam|asalam|assalam o alaikum|assalamualaikum|hy)\b/i;
const HUMAN_RE = /\b(human|agent|real person|representative|manager|insaan|banda|call me|talk to (someone|a person))\b/i;

const CONTACT_RE = /\b(contact|phone|number|call|email|e-?mail|whats ?app|reach|address|location|located|office|rabta|raabta|kahan|where)\b/i;

// Extra words to look for, so "fees kitni hai" also matches "Price: Rs. ...".
const EXPANSIONS: [RegExp, string[]][] = [
  [/\b(price|pricing|cost|costs|fee|fees|charge|charges|rate|rates|kitne|kitna|kitni|qeemat|package|packages|budget)\b/i, ["price", "rs", "pkr", "fee", "cost", "package", "starting"]],
  [/\b(time|timing|timings|hour|hours|open|close|closed|kab|schedule|day|days)\b/i, ["timing", "hour", "open", "am", "pm", "monday", "saturday", "sunday", "daily"]],
  [/\b(service|services|offer|offers|provide|do you do|kya karte|work|build)\b/i, ["service", "offer", "provide", "build", "develop", "solution"]],
];

const GLOBAL_EMAIL_RE = /[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g;
const GLOBAL_PHONE_RE = /(?:\+|00)?\d[\d\s()-]{8,16}\d/g;
const ADDRESS_LINE_RE = /\b(address|located|location|office|plot|street|road|block|floor|sector|phase|town|city)\b/i;
// A real address has a number or a place name, and is not a sentence like "Write to the address below".
const PLACE_RE = /\d|\b(pakistan|lahore|karachi|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|sialkot|gujranwala|hyderabad|dubai|uae|usa|uk)\b/i;
const NOT_ADDRESS_RE = /\b(write|below|above|respond|policy|please|will|within|send|contact us|email us)\b/i;

export function demoProvider(): AiProvider {
  return {
    id: "demo",
    label: "Knowledge-only answers",
    model: "keyword + knowledge search",
    async generate(req) {
      return { text: await knowledgeReply(req), inputTokens: 0, outputTokens: 0 };
    },
  };
}

function askFor(bot: AiRequest["bot"]) {
  if (bot.skills.booking) return "Would you like to book? Just share your name and phone number.";
  if (bot.skills.orders) return "Would you like to place an order? Share your name and phone number.";
  if (bot.skills.leads) return "If you'd like our team to help you further, share your name and phone number.";
  return "";
}

const cleanLine = (raw: string) =>
  raw
    .replace(/^#+\s*/, "")
    .replace(/^[-*•]\s*/, "")
    .replace(/\*\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

function unique<T>(items: T[], key: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const k = key(item);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Phone numbers, emails and address lines found in the text. */
function contactDetails(text: string) {
  const emails = unique(text.match(GLOBAL_EMAIL_RE) ?? [], (e) => e.toLowerCase()).slice(0, 3);
  const phones = unique(
    (text.match(GLOBAL_PHONE_RE) ?? []).map((p) => p.trim()).filter((p) => {
      const digits = p.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 13;
    }),
    (p) => p.replace(/\D/g, "").slice(-10),
  ).slice(0, 4);
  const addresses = unique(
    text
      .split("\n")
      .map(cleanLine)
      .filter(
        (line) =>
          line.length >= 12 &&
          line.length <= 160 &&
          ADDRESS_LINE_RE.test(line) &&
          PLACE_RE.test(line) &&
          !NOT_ADDRESS_RE.test(line) &&
          !EMAIL_RE.test(line),
      )
      .map((line) => line.replace(/^(address|location|office)\s*[:-]\s*/i, "")),
    (a) => a.toLowerCase(),
  )
    // Prefer exact addresses ("Plot # 236, Block E-1...") over sentences that only mention an area.
    .sort((a, b) => Number(/\d/.test(b)) - Number(/\d/.test(a)))
    .slice(0, 2);
  return { emails, phones, addresses };
}

/** The few sentences that best answer the question, keeping the knowledge search's ranking as a tie-breaker. */
function bestSentences(knowledge: string, question: string, limit = 3) {
  const extra = EXPANSIONS.filter(([re]) => re.test(question)).flatMap(([, words]) => words);
  const terms = new Set(tokenize([question, ...extra].join(" ")));
  if (!terms.size) return [];

  const candidates: { line: string; score: number; order: number }[] = [];
  // Blocks are in retrieval order: quick notes first, then search results from best to worst.
  knowledge.split(/\n\s*---\s*\n/).forEach((block, blockIndex) => {
    for (const raw of block.split(/\n|(?<=[.!?۔])\s+/)) {
      if (raw.startsWith("[From:")) continue;
      const line = cleanLine(raw);
      if (line.length < 15) continue;
      const overlap = tokenize(line).filter((w) => terms.has(w)).length;
      if (overlap === 0) continue;
      candidates.push({ line: line.length > 280 ? `${line.slice(0, 277)}...` : line, score: overlap + 1 / (2 + blockIndex), order: candidates.length });
    }
  });

  return unique(candidates, (c) => c.line.toLowerCase())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.order - b.order)
    .map((c) => c.line);
}

async function knowledgeReply({ messages, bot, knowledge }: AiRequest): Promise<string> {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = userMessages.at(-1) ?? "";
  const earlier = userMessages.slice(0, -1).join("\n");
  const ask = askFor(bot);

  // Lead capture: the customer sent a phone number.
  const phone = last.match(PHONE_RE)?.[0];
  if (bot.skills.leads && phone && !PHONE_RE.test(earlier)) {
    const all = userMessages.join("\n");
    const name =
      all
        .match(NAME_RE)?.[1]
        .split(/\s+/)
        .filter((w) => !NAME_FILLER.has(w.toLowerCase()))
        .join(" ") || undefined;
    const email = all.match(EMAIL_RE)?.[0];
    const need = userMessages.find((m) => !GREETING_RE.test(m.trim()) && !PHONE_RE.test(m)) ?? "";
    const lead = JSON.stringify({ name, phone, email, need: need.slice(0, 200) });
    return `Thank you${name ? ` ${name}` : ""}! Our team at ${bot.businessName} will contact you on ${phone} shortly.\n\nIs there anything else I can help you with?\n<lead>${lead}</lead>`;
  }

  if (bot.skills.handoff && HUMAN_RE.test(last)) {
    const hasPhone = userMessages.some((m) => PHONE_RE.test(m));
    return `Sure, I'll ask a team member from ${bot.businessName} to get in touch.${hasPhone ? "" : " Please share your name and phone number so they can reach you."}\n<handoff/>`;
  }

  if (GREETING_RE.test(last.trim()) && last.length < 40) {
    return `Walaikum Assalam! I'm the assistant for ${bot.businessName}. You can ask me about our services, prices or timings.`;
  }

  // Contact questions: reply with the real phone numbers, emails and address from the knowledge.
  if (CONTACT_RE.test(last)) {
    const contactHits = await searchKnowledge(bot.id, "contact phone call email whatsapp address location office").catch(() => []);
    const details = contactDetails([bot.knowledge, knowledge, ...contactHits.map((h) => h.text)].join("\n"));
    const lines = [
      details.phones.length ? `- **Phone:** ${details.phones.join(", ")}` : "",
      details.emails.length ? `- **Email:** ${details.emails.join(", ")}` : "",
      details.addresses.length ? `- **Address:** ${details.addresses[0]}` : "",
    ].filter(Boolean);
    if (lines.length) {
      return `You can reach ${bot.businessName} here:\n\n${lines.join("\n")}${ask ? `\n\n${ask}` : ""}`;
    }
  }

  const sentences = bestSentences(knowledge, last);
  if (sentences.length) {
    return `${sentences.map((s) => `- ${s}`).join("\n")}${ask ? `\n\n${ask}` : ""}`;
  }

  return `Sorry, I don't have that information right now. ${ask || "Please contact us directly and our team will help you."}`;
}
