import { anthropicProvider } from "./anthropic";
import { demoProvider } from "./demo";
import { recordAiFailure } from "./failures";
import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";
import type { AiProvider, AiRequest, AiResult, ProviderId } from "./types";

type KeyedProvider = Exclude<ProviderId, "demo">;

export interface ProviderStatus {
  active: ProviderId;
  label: string;
  model: string;
  warning?: string;
  /** Providers tried, in order, if the main one fails. The last is always knowledge-only answers. */
  fallbacks: string[];
}

const KEY_ENV: Record<KeyedProvider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  groq: "GROQ_API_KEY",
};

const FACTORIES: Record<KeyedProvider, (key: string) => AiProvider> = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  groq: groqProvider,
};

const ORDER: KeyedProvider[] = ["anthropic", "gemini", "groq"];
// Settings that change which providers/models are built.
const SETTINGS = ["AI_PROVIDER", ...ORDER.map((id) => KEY_ENV[id]), "CLAUDE_MODEL", "GEMINI_MODEL", "GROQ_MODEL"];

let cached: { signature: string; chain: AiProvider[]; warning?: string } | null = null;

/**
 * The providers to try, in order: the main one (AI_PROVIDER, or the first with a key),
 * then every other provider that has a key, then knowledge-only answers, which never fail.
 */
function resolve() {
  const signature = SETTINGS.map((name) => process.env[name] ?? "").join("|");
  if (cached?.signature === signature) return cached;

  const choice = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const demo = demoProvider();
  const keyed = ORDER.filter((id) => process.env[KEY_ENV[id]]).map((id) => FACTORIES[id](process.env[KEY_ENV[id]]!));
  let warning: string | undefined;
  let chain: AiProvider[];

  if (choice === "demo") {
    chain = [demo];
  } else {
    let primary: AiProvider | undefined;
    if (choice in FACTORIES) {
      primary = keyed.find((p) => p.id === choice);
      if (!primary) {
        warning = `AI_PROVIDER is "${choice}" but ${KEY_ENV[choice as KeyedProvider]} is not set, so ${keyed[0]?.label ?? "demo mode"} is used.`;
      }
    }
    primary ??= keyed[0];
    chain = [...(primary ? [primary] : []), ...keyed.filter((p) => p !== primary), demo];
  }
  cached = { signature, chain, warning };
  return cached;
}

export function getProvider(): AiProvider {
  return resolve().chain[0];
}

/**
 * Generates a reply. If a provider fails (free quota used up, outage, bad key), the next one is
 * tried, ending with answers taken straight from the bot's knowledge, so customers always get a reply.
 */
export async function generateWithFallback(req: AiRequest): Promise<AiResult & { provider: ProviderId }> {
  const { chain } = resolve();
  let lastError: unknown;
  for (const [i, provider] of chain.entries()) {
    try {
      return { ...(await provider.generate(req)), provider: provider.id };
    } catch (error) {
      lastError = error;
      const message = (error instanceof Error ? error.message : String(error)).split("\n")[0].slice(0, 300);
      const next = chain[i + 1];
      console.warn(`[ai] ${provider.label} failed: ${message}${next ? ` -> answering with ${next.label}` : ""}`);
      await recordAiFailure(provider.label, message).catch(() => undefined);
    }
  }
  throw lastError;
}

export function providerStatus(): ProviderStatus {
  const { chain, warning } = resolve();
  const primary = chain[0];
  return {
    active: primary.id,
    label: primary.label,
    model: primary.model,
    warning,
    fallbacks: chain.slice(1).map((p) => (p.id === "demo" ? "answers from the bot's knowledge" : p.label)),
  };
}
