import { createHash, createHmac } from "crypto";
import { decrypt, encrypt, safeEqual } from "./crypto";
import { getBot, upsertLead } from "./db";
import { runChat } from "./engine";
import { HttpError, isUniqueViolation } from "./errors";
import { getPlan } from "./plans";
import { db, iso, opt, type Row } from "./sql";

// WhatsApp Cloud API (Meta). One webhook for the whole app; each bot is linked
// to a WhatsApp phone number ID with its own access token (stored encrypted).

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v23.0";
const MAX_INCOMING = 1000;
const MAX_OUTGOING = 4096;

export interface WhatsAppAccount {
  botId: string;
  phoneNumberId: string;
  displayPhone?: string;
  enabled: boolean;
  lastMessageAt?: string;
  lastError?: string;
  updatedAt: string;
}

const COLUMNS = "bot_id, phone_number_id, display_phone, enabled, last_message_at, last_error, updated_at";

const toAccount = (r: Row): WhatsAppAccount => ({
  botId: String(r.bot_id),
  phoneNumberId: String(r.phone_number_id),
  displayPhone: opt(r.display_phone),
  enabled: Boolean(r.enabled),
  lastMessageAt: r.last_message_at ? iso(r.last_message_at) : undefined,
  lastError: opt(r.last_error),
  updatedAt: iso(r.updated_at),
});

export async function getWhatsAppAccount(botId: string) {
  const sql = await db();
  const [row] = await sql.query(`SELECT ${COLUMNS} FROM whatsapp_accounts WHERE bot_id = $1`, [botId]);
  return row ? toAccount(row) : null;
}

export async function saveWhatsAppAccount(
  botId: string,
  input: { phoneNumberId: string; displayPhone?: string; accessToken?: string; enabled: boolean },
) {
  const sql = await db();
  const token = input.accessToken?.trim();
  if (!token && !(await getWhatsAppAccount(botId))) throw new HttpError(400, "Access token is required");
  try {
    const [row] = await sql.query(
      `INSERT INTO whatsapp_accounts (bot_id, phone_number_id, display_phone, access_token, enabled)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (bot_id) DO UPDATE SET
         phone_number_id = EXCLUDED.phone_number_id,
         display_phone = EXCLUDED.display_phone,
         access_token = CASE WHEN $6::boolean THEN EXCLUDED.access_token ELSE whatsapp_accounts.access_token END,
         enabled = EXCLUDED.enabled,
         last_error = NULL,
         updated_at = now()
       RETURNING ${COLUMNS}`,
      [botId, input.phoneNumberId, input.displayPhone || null, token ? encrypt(token) : "", input.enabled, !!token],
    );
    return toAccount(row);
  } catch (error) {
    if (isUniqueViolation(error)) throw new HttpError(409, "This phone number ID is already connected to another bot");
    throw error;
  }
}

export async function deleteWhatsAppAccount(botId: string) {
  const sql = await db();
  return (await sql.query("DELETE FROM whatsapp_accounts WHERE bot_id = $1 RETURNING bot_id", [botId])).length > 0;
}

async function accountByPhoneNumberId(phoneNumberId: string) {
  const sql = await db();
  const [row] = await sql.query("SELECT bot_id, access_token, enabled FROM whatsapp_accounts WHERE phone_number_id = $1", [phoneNumberId]);
  return row ? { botId: String(row.bot_id), token: decrypt(String(row.access_token)), enabled: Boolean(row.enabled) } : null;
}

async function markStatus(botId: string, error: string | null) {
  const sql = await db();
  await sql.query("UPDATE whatsapp_accounts SET last_message_at = now(), last_error = $2 WHERE bot_id = $1", [botId, error]);
}

// ---- Webhook security ----

/** Meta signs every webhook with the app secret (X-Hub-Signature-256). */
export function verifyWhatsAppSignature(rawBody: string, header: string | null) {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  return safeEqual(header.slice("sha256=".length), expected);
}

export function verifyWebhookToken(token: string | null) {
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;
  return !!expected && !!token && safeEqual(token, expected);
}

// ---- Messages ----

/** WhatsApp uses *bold*; convert chat formatting and flatten headings. */
export function toWhatsAppText(text: string) {
  return text
    .replace(/\*\*([^*\n]+?)\*\*/g, "*$1*")
    .replace(/__([^_\n]+?)__/g, "*$1*")
    .replace(/^#{1,6}\s+(.*)$/gm, "*$1*")
    .slice(0, MAX_OUTGOING);
}

async function sendText(phoneNumberId: string, token: string, to: string, body: string) {
  if (process.env.WHATSAPP_DRY_RUN === "true") {
    console.log(`[whatsapp:dry-run] to +${to}:\n${body}`);
    return;
  }
  const res = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(`WhatsApp send failed (${res.status}): ${data?.error?.message ?? res.statusText}`);
  }
}

/** Meta can deliver the same message more than once; only handle it the first time. */
async function claimMessage(messageId: string) {
  const sql = await db();
  return (await sql.query("INSERT INTO whatsapp_events (message_id) VALUES ($1) ON CONFLICT DO NOTHING RETURNING message_id", [messageId])).length > 0;
}

const conversationIdFor = (botId: string, waId: string) =>
  createHash("sha256").update(`whatsapp:${botId}:${waId}`).digest("hex").slice(0, 16);

interface IncomingMessage {
  id?: string;
  from?: string;
  type?: string;
  text?: { body?: string };
  button?: { text?: string };
  interactive?: { button_reply?: { title?: string }; list_reply?: { title?: string } };
}

export interface WhatsAppWebhookPayload {
  object?: string;
  entry?: {
    changes?: {
      field?: string;
      value?: {
        metadata?: { phone_number_id?: string };
        contacts?: { wa_id?: string; profile?: { name?: string } }[];
        messages?: IncomingMessage[];
      };
    }[];
  }[];
}

function messageText(message: IncomingMessage) {
  if (message.type === "text") return message.text?.body;
  if (message.type === "button") return message.button?.text;
  if (message.type === "interactive") return message.interactive?.button_reply?.title ?? message.interactive?.list_reply?.title;
  return undefined;
}

export async function handleWhatsAppWebhook(payload: WhatsAppWebhookPayload) {
  if (payload.object !== "whatsapp_business_account") return;
  for (const entry of payload.entry ?? []) {
    for (const change of entry.changes ?? []) {
      const value = change.value;
      const phoneNumberId = value?.metadata?.phone_number_id;
      if (change.field !== "messages" || !phoneNumberId || !value?.messages?.length) continue;
      const names = new Map((value.contacts ?? []).map((c) => [c.wa_id, c.profile?.name]));
      for (const message of value.messages) {
        await handleMessage(phoneNumberId, message, message.from ? names.get(message.from) : undefined);
      }
    }
  }
}

async function handleMessage(phoneNumberId: string, message: IncomingMessage, profileName?: string) {
  if (!message.id || !message.from) return;
  const account = await accountByPhoneNumberId(phoneNumberId);
  if (!account?.enabled || !(await claimMessage(message.id))) return;
  const bot = await getBot(account.botId);
  if (!bot) return;

  const plan = getPlan(bot.plan);
  if (!plan.whatsapp) {
    await markStatus(bot.id, `The ${plan.label} plan does not include WhatsApp. Upgrade the plan to reply.`);
    return;
  }

  try {
    const text = messageText(message)?.trim();
    let reply = "Sorry, I can only read text messages at the moment. Please type your question.";
    if (text) {
      const contact = `+${message.from}`;
      const result = await runChat({
        botId: bot.id,
        message: text.slice(0, MAX_INCOMING),
        conversationId: conversationIdFor(bot.id, message.from),
        trustedConversationId: true,
        channel: "whatsapp",
        contact,
        pageUrl: "whatsapp",
      });
      // Every WhatsApp chat is a lead: keep any name/phone the customer typed, fill in the rest.
      if (!result.blocked) await upsertLead(bot.id, result.conversationId, { phone: contact, name: profileName }, { keepExisting: true });
      reply = result.reply;
    }
    await sendText(phoneNumberId, account.token, message.from, toWhatsAppText(reply));
    await markStatus(bot.id, null);
  } catch (error) {
    console.error("[whatsapp]", error);
    await markStatus(bot.id, (error as Error).message.slice(0, 300)).catch(() => undefined);
  }
}
