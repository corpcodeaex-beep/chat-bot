import { createHash, randomBytes } from "crypto";
import { BRAND } from "./brand";
import { getClient, getClientLogin, setClientPassword } from "./clients";
import { sendEmail } from "./email";
import { HttpError } from "./errors";
import { db, iso } from "./sql";

// Company "forgot password": a one-time link valid for 1 hour. Only a hash of the token is stored,
// so a database leak can't be used to reset passwords.

const VALID_MINUTES = 60;
const MIN_SECONDS_BETWEEN_REQUESTS = 60;

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

const escapeHtml = (text: string) => text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** Emails a reset link if the email belongs to an active company. Always resolves the same way so emails can't be guessed. */
export async function requestPasswordReset(email: string, appUrl: string) {
  const login = await getClientLogin(email);
  if (!login || login.status !== "active") return;

  const sql = await db();
  const [recent] = await sql.query(
    "SELECT 1 FROM password_resets WHERE client_id = $1 AND created_at > now() - $2::interval",
    [login.id, `${MIN_SECONDS_BETWEEN_REQUESTS} seconds`],
  );
  if (recent) return;

  const client = await getClient(login.id);
  if (!client) return;

  const token = randomBytes(32).toString("base64url");
  const link = `${appUrl}/reset-password?token=${token}`;
  await sql.query(
    "INSERT INTO password_resets (token_hash, client_id, expires_at) VALUES ($1, $2, now() + $3::interval)",
    [hashToken(token), client.id, `${VALID_MINUTES} minutes`],
  );

  const sent = await sendEmail({
    to: client.email,
    subject: `Reset your ${BRAND.name} password`,
    text: `Hi ${client.name},\n\nSomeone asked to reset the password for your ${BRAND.name} account. Open this link within ${VALID_MINUTES} minutes to choose a new password:\n\n${link}\n\nIf you didn't ask for this, you can ignore this email; your password stays the same.`,
    html: `<p>Hi ${escapeHtml(client.name)},</p>
<p>Someone asked to reset the password for your ${BRAND.name} account. Click the button within ${VALID_MINUTES} minutes to choose a new password.</p>
<p><a href="${link}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">Choose a new password</a></p>
<p style="color:#64748b;font-size:13px">If you didn't ask for this, ignore this email; your password stays the same.</p>`,
  }).catch(() => false);

  await sql.query("UPDATE password_resets SET email_sent = $1 WHERE token_hash = $2", [sent, hashToken(token)]);
}

/** Checks a reset link without using it (for the reset page). */
export async function isResetTokenValid(token: string) {
  const sql = await db();
  const [row] = await sql.query(
    `SELECT 1 FROM password_resets r JOIN clients c ON c.id = r.client_id
     WHERE r.token_hash = $1 AND r.used_at IS NULL AND r.expires_at > now() AND c.status = 'active'`,
    [hashToken(token)],
  );
  return !!row;
}

/** Sets the new password, uses up the link and signs the company out everywhere. */
export async function resetPassword(token: string, password: string) {
  const sql = await db();
  const [row] = await sql.query(
    `UPDATE password_resets r SET used_at = now()
     FROM clients c
     WHERE r.token_hash = $1 AND r.used_at IS NULL AND r.expires_at > now() AND c.id = r.client_id AND c.status = 'active'
     RETURNING r.client_id`,
    [hashToken(token)],
  );
  if (!row) throw new HttpError(400, "This reset link is invalid or has expired. Please ask for a new one.");
  const clientId = String(row.client_id);
  await setClientPassword(clientId, password);
  // Any other open links for this company stop working too.
  await sql.query("UPDATE password_resets SET used_at = now() WHERE client_id = $1 AND used_at IS NULL", [clientId]);
}

/** Recent requests that could not be emailed, so the admin can help. */
export async function getUnsentResetRequests() {
  const sql = await db();
  const rows = await sql.query(
    `SELECT DISTINCT ON (r.client_id) r.client_id, c.name, r.created_at
     FROM password_resets r JOIN clients c ON c.id = r.client_id
     WHERE r.email_sent = false AND r.used_at IS NULL AND r.created_at > now() - interval '24 hours'
     ORDER BY r.client_id, r.created_at DESC`,
  );
  return rows.map((r) => ({ clientId: String(r.client_id), name: String(r.name), at: iso(r.created_at) }));
}
