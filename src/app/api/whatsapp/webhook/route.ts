import { after } from "next/server";
import { handleWhatsAppWebhook, verifyWebhookToken, verifyWhatsAppSignature, type WhatsAppWebhookPayload } from "@/lib/whatsapp";

// Meta WhatsApp Cloud API webhook: Callback URL = https://YOUR-APP/api/whatsapp/webhook

/** Meta calls this once when you save the webhook, to check the verify token. */
export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  if (params.get("hub.mode") === "subscribe" && verifyWebhookToken(params.get("hub.verify_token"))) {
    return new Response(params.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** Incoming messages. Answer Meta immediately, then generate and send replies in the background. */
export async function POST(request: Request) {
  const raw = await request.text();
  if (!verifyWhatsAppSignature(raw, request.headers.get("x-hub-signature-256"))) {
    if (!process.env.WHATSAPP_APP_SECRET) console.warn("[whatsapp] WHATSAPP_APP_SECRET is not set; rejecting webhook");
    return new Response("Invalid signature", { status: 401 });
  }
  let payload: WhatsAppWebhookPayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }
  after(() => handleWhatsAppWebhook(payload).catch((error) => console.error("[whatsapp] webhook failed", error)));
  return new Response("OK", { status: 200 });
}
