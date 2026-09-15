import nodemailer, { type Transporter } from "nodemailer";
import { BRAND } from "./brand";

// Sends email through SMTP (e.g. Gmail with an app password) or, if SMTP isn't set, through Resend.
// With neither configured nothing is sent; callers handle that (e.g. the admin is notified instead).
//
// Gmail settings:
//   SMTP_HOST=smtp.gmail.com  SMTP_PORT=587  SMTP_USE_TLS=true
//   SMTP_USER=you@gmail.com   SMTP_PASSWORD=<16-letter app password>
//   SMTP_FROM_EMAIL=...       SMTP_FROM_NAME=...   (SMTP_PASS / EMAIL_FROM also accepted)

const smtpPassword = () => process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";

const smtpConfigured = () => !!(process.env.SMTP_HOST && process.env.SMTP_USER && smtpPassword());

export const emailConfigured = () => smtpConfigured() || !!process.env.RESEND_API_KEY;

let cached: { signature: string; transporter: Transporter } | null = null;

function smtpTransport(): Transporter {
  const port = Number(process.env.SMTP_PORT || 587);
  const useTls = (process.env.SMTP_USE_TLS ?? "true").toLowerCase() !== "false";
  const signature = [process.env.SMTP_HOST, port, useTls, process.env.SMTP_USER, smtpPassword()].join("|");
  if (cached?.signature !== signature) {
    cached = {
      signature,
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        // Port 465 is encrypted from the start; 587 starts plain and upgrades (STARTTLS), required when SMTP_USE_TLS=true.
        secure: port === 465,
        requireTLS: port !== 465 && useTls,
        auth: {
          user: process.env.SMTP_USER,
          // Google shows app passwords in groups of four ("abcd efgh ijkl mnop").
          pass: smtpPassword().replace(/\s+/g, ""),
        },
      }),
    };
  }
  return cached.transporter;
}

function fromAddress() {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  const name = process.env.SMTP_FROM_NAME || BRAND.name;
  // Gmail only keeps a different From address if it is added under "Send mail as"; otherwise it uses SMTP_USER.
  const address = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "onboarding@resend.dev";
  return `${name} <${address}>`;
}

/** Checks the SMTP login without sending anything. */
export async function verifyEmailSetup(): Promise<{ ok: boolean; method: "smtp" | "resend" | "none"; error?: string }> {
  if (smtpConfigured()) {
    try {
      await smtpTransport().verify();
      return { ok: true, method: "smtp" };
    } catch (error) {
      return { ok: false, method: "smtp", error: (error as Error).message };
    }
  }
  return process.env.RESEND_API_KEY ? { ok: true, method: "resend" } : { ok: false, method: "none" };
}

export async function sendEmail(message: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  if (smtpConfigured()) {
    try {
      await smtpTransport().sendMail({ from: fromAddress(), to: message.to, subject: message.subject, text: message.text, html: message.html });
      return true;
    } catch (error) {
      console.error(`[email] SMTP error: ${(error as Error).message}`);
      return false;
    }
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] No email service configured (SMTP settings or RESEND_API_KEY); not sending "${message.subject}" to ${message.to}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: fromAddress(), to: [message.to], subject: message.subject, html: message.html, text: message.text }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    console.error(`[email] Resend error (${res.status}): ${data?.message ?? res.statusText}`);
    return false;
  }
  return true;
}
