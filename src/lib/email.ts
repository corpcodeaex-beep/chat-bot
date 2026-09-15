// Sends email through Resend (https://resend.com, free plan available).
// Without RESEND_API_KEY nothing is sent; callers handle that (e.g. the admin is notified instead).

export const emailConfigured = () => !!process.env.RESEND_API_KEY;

export async function sendEmail(message: { to: string; subject: string; html: string; text: string }): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.warn(`[email] RESEND_API_KEY is not set; not sending "${message.subject}" to ${message.to}`);
    return false;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // A verified domain is needed to email anyone; onboarding@resend.dev only reaches your own Resend address.
      from: process.env.EMAIL_FROM || "ChatDesk <onboarding@resend.dev>",
      to: [message.to],
      subject: message.subject,
      html: message.html,
      text: message.text,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    console.error(`[email] Resend error (${res.status}): ${data?.message ?? res.statusText}`);
    return false;
  }
  return true;
}
