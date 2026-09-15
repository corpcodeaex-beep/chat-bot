import { anthropicProvider } from "./anthropic";
import { demoProvider } from "./demo";
import { geminiProvider } from "./gemini";
import { groqProvider } from "./groq";
import type { AiProvider, ProviderId } from "./types";

export interface ProviderStatus {
  active: ProviderId;
  label: string;
  model: string;
  warning?: string;
}

const KEY_ENV: Record<Exclude<ProviderId, "demo">, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  gemini: "GEMINI_API_KEY",
  groq: "GROQ_API_KEY",
};

const FACTORIES: Record<Exclude<ProviderId, "demo">, (key: string) => AiProvider> = {
  anthropic: anthropicProvider,
  gemini: geminiProvider,
  groq: groqProvider,
};

let cached: { signature: string; provider: AiProvider; warning?: string } | null = null;

function resolve(): { provider: AiProvider; warning?: string } {
  const choice = (process.env.AI_PROVIDER || "auto").toLowerCase();
  const signature = [choice, ...Object.values(KEY_ENV).map((k) => process.env[k] ?? "")].join("|");
  if (cached?.signature === signature) return cached;

  let result: { provider: AiProvider; warning?: string };
  if (choice === "demo") {
    result = { provider: demoProvider() };
  } else if (choice in FACTORIES) {
    const id = choice as keyof typeof FACTORIES;
    const key = process.env[KEY_ENV[id]];
    result = key
      ? { provider: FACTORIES[id](key) }
      : { provider: demoProvider(), warning: `AI_PROVIDER is "${id}" but ${KEY_ENV[id]} is not set, so demo mode is used.` };
  } else {
    // auto: use the first provider that has a key.
    const id = (Object.keys(FACTORIES) as (keyof typeof FACTORIES)[]).find((p) => process.env[KEY_ENV[p]]);
    result = id ? { provider: FACTORIES[id](process.env[KEY_ENV[id]]!) } : { provider: demoProvider() };
  }
  cached = { signature, ...result };
  return result;
}

export function getProvider(): AiProvider {
  return resolve().provider;
}

export function providerStatus(): ProviderStatus {
  const { provider, warning } = resolve();
  return { active: provider.id, label: provider.label, model: provider.model, warning };
}
