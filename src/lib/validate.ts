import { ValidationError } from "./errors";
import { PLAN_KEYS } from "./plans";
import type { BotContent, BotStatus, LanguageMode, SkillKey } from "./types";

const LANGUAGES: LanguageMode[] = ["auto", "english", "urdu", "roman-urdu"];
const SKILLS: SkillKey[] = ["leads", "booking", "orders", "handoff"];

const LIMITS = { name: 80, businessName: 120, template: 40, welcome: 500, instructions: 6000, knowledge: 200_000 };

/** Setup-tab fields: keeps only known fields with the right types. */
export function cleanBotInput(body: unknown): Partial<BotContent> {
  if (!body || typeof body !== "object") throw new ValidationError("Invalid request body");
  const input = body as Record<string, unknown>;
  const out: Partial<BotContent> = {};

  for (const field of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
    const value = input[field];
    if (value === undefined) continue;
    if (typeof value !== "string") throw new ValidationError(`${field} must be text`);
    if (value.length > LIMITS[field]) throw new ValidationError(`${field} is too long (max ${LIMITS[field]} characters)`);
    out[field] = value;
  }
  if (input.color !== undefined) {
    if (typeof input.color !== "string" || !/^#[0-9a-f]{6}$/i.test(input.color)) throw new ValidationError("color must be like #4f46e5");
    out.color = input.color;
  }
  if (input.language !== undefined) {
    if (!LANGUAGES.includes(input.language as LanguageMode)) throw new ValidationError("Unknown language");
    out.language = input.language as LanguageMode;
  }
  if (input.skills !== undefined) {
    const skills = input.skills as Record<string, unknown>;
    if (!skills || typeof skills !== "object") throw new ValidationError("skills must be an object");
    out.skills = Object.fromEntries(SKILLS.map((k) => [k, skills[k] === true])) as Record<SkillKey, boolean>;
  }
  return out;
}

export interface PlanInput {
  clientId?: string | null;
  plan?: string;
  status?: BotStatus;
  trialEndsAt?: string | null;
  messageLimit?: number | null;
}

/** Plan-tab fields. Empty strings clear optional values. */
export function cleanPlanInput(body: unknown): PlanInput {
  if (!body || typeof body !== "object") throw new ValidationError("Invalid request body");
  const input = body as Record<string, unknown>;
  const out: PlanInput = {};
  const empty = (v: unknown) => v === null || v === "";

  if (input.clientId !== undefined) {
    if (!empty(input.clientId) && typeof input.clientId !== "string") throw new ValidationError("Invalid client");
    out.clientId = empty(input.clientId) ? null : (input.clientId as string);
  }
  if (input.plan !== undefined) {
    if (!PLAN_KEYS.includes(input.plan as (typeof PLAN_KEYS)[number])) throw new ValidationError("Unknown plan");
    out.plan = input.plan as string;
  }
  if (input.status !== undefined) {
    if (input.status !== "active" && input.status !== "paused") throw new ValidationError("Status must be active or paused");
    out.status = input.status;
  }
  if (input.trialEndsAt !== undefined) {
    if (empty(input.trialEndsAt)) out.trialEndsAt = null;
    else if (typeof input.trialEndsAt === "string" && /^\d{4}-\d{2}-\d{2}$/.test(input.trialEndsAt)) {
      // End of that day in Pakistan time.
      out.trialEndsAt = new Date(`${input.trialEndsAt}T23:59:59+05:00`).toISOString();
    } else throw new ValidationError("Trial end must be a date");
  }
  if (input.messageLimit !== undefined) {
    const n = Number(input.messageLimit);
    if (empty(input.messageLimit)) out.messageLimit = null;
    else if (Number.isInteger(n) && n >= 0 && n <= 10_000_000) out.messageLimit = n;
    else throw new ValidationError("Message limit must be a whole number");
  }
  return out;
}

export function cleanName(value: unknown) {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name || name.length > 120) throw new ValidationError("Enter a name (up to 120 characters)");
  return name;
}

export function cleanEmail(value: unknown) {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) throw new ValidationError("Enter a valid email address");
  return email;
}

export function cleanPassword(value: unknown) {
  const password = typeof value === "string" ? value : "";
  if (password.length < 8 || password.length > 200) throw new ValidationError("Password must be at least 8 characters");
  return password;
}
