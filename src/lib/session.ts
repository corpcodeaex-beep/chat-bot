import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionToken, SESSION_COOKIE } from "./auth";
import { getClient } from "./clients";
import { getBot } from "./db";
import { HttpError } from "./errors";
import type { Bot } from "./types";

export type Viewer = { role: "admin"; name: string } | { role: "client"; clientId: string; name: string; email: string };

/** The logged-in user, or null. Company sessions end when the company is deleted, made inactive, or its password changes. */
export async function getViewer(): Promise<Viewer | null> {
  const session = readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return null;
  if (session.role === "admin") return { role: "admin", name: "Admin" };
  const client = await getClient(session.clientId);
  if (!client || client.status !== "active" || client.sessionVersion !== session.version) return null;
  return { role: "client", clientId: client.id, name: client.name, email: client.email };
}

// ---- Route handlers (throw HttpError; wrap with errorResponse) ----

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) throw new HttpError(401, "Not logged in");
  return viewer;
}

export async function requireAdmin() {
  const viewer = await requireViewer();
  if (viewer.role !== "admin") throw new HttpError(403, "Only the admin can do this");
  return viewer;
}

/** The bot, if this user may manage it. Other clients' bots look like they don't exist. */
export async function requireBot(botId: string): Promise<{ viewer: Viewer; bot: Bot }> {
  const viewer = await requireViewer();
  const bot = await getBot(botId);
  if (!bot || (viewer.role === "client" && bot.clientId !== viewer.clientId)) throw new HttpError(404, "Bot not found");
  return { viewer, bot };
}

// ---- Pages (redirect instead of throwing) ----

export async function pageViewer(): Promise<Viewer> {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}

export async function pageAdmin() {
  const viewer = await pageViewer();
  if (viewer.role !== "admin") redirect("/dashboard");
  return viewer;
}
