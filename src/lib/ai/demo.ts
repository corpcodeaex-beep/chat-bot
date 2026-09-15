import { rankChunks } from "../knowledge";
import type { AiProvider, AiRequest } from "./types";

// Works with NO API key. It finds the best-matching part of the business
// knowledge and runs a simple lead-capture flow, so you can demo the widget,
// dashboard and lead collection to clients before paying for any AI.

const PHONE_RE = /(\+?92[\s-]?3\d{2}[\s-]?\d{7}|\b03\d{2}[\s-]?\d{7}\b|\+?\d[\d\s-]{8,14}\d)/;
const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const NAME_RE = /(?:my name is|i am|i'm|mera naam|name[:\s]+|naam[:\s]+)\s*([\p{L}]+(?:\s[\p{L}]+)?)/iu;
// Words that follow a name in "mera naam Sara hai" / "I am Ali and..." and are not part of it.
const NAME_FILLER = new Set(["hai", "hain", "hoon", "hun", "and", "my", "number", "phone", "is", "here", "aur", "ka", "ki"]);
const GREETING_RE = /^(hi|hello|hey|salam|salaam|aoa|assalam|asalam|assalam o alaikum|assalamualaikum|hy)\b/i;
const HUMAN_RE = /\b(human|agent|real person|representative|manager|insaan|banda|call me|talk to (someone|a person))\b/i;

export function demoProvider(): AiProvider {
  return {
    id: "demo",
    label: "Demo mode (no API key)",
    model: "keyword-matching",
    async generate(req) {
      return { text: demoReply(req), inputTokens: 0, outputTokens: 0 };
    },
  };
}

function demoReply({ messages, bot, knowledge }: AiRequest): string {
  const userMessages = messages.filter((m) => m.role === "user").map((m) => m.content);
  const last = userMessages.at(-1) ?? "";
  const earlier = userMessages.slice(0, -1).join("\n");

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

  // `knowledge` already holds the retrieved notes and document pieces; show the best ones.
  const matches = rankChunks(knowledge, last, 2).map((chunk) =>
    chunk
      .split("\n")
      .filter((line) => line.trim() !== "---" && !line.startsWith("[From:"))
      .join("\n")
      .trim(),
  );
  const ask = bot.skills.booking
    ? "Would you like to book? Just share your name and phone number."
    : bot.skills.orders
      ? "Would you like to place an order? Share your name and phone number."
      : bot.skills.leads
        ? "If you'd like our team to help you further, share your name and phone number."
        : "";

  if (matches.length > 0) {
    const answer = matches.join("\n\n").slice(0, 900);
    return `Here's what I found:\n\n${answer}${ask ? `\n\n${ask}` : ""}`;
  }

  return `Sorry, I don't have that information right now. ${ask || "Please contact us directly and our team will help you."}`;
}
