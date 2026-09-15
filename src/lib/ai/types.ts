import type { Bot } from "../types";

export type ProviderId = "demo" | "gemini" | "anthropic" | "groq";

export interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiRequest {
  system: string;
  messages: AiMessage[];
  /** Raw bot + matched knowledge, used by the no-key demo provider. */
  bot: Bot;
  knowledge: string;
}

export interface AiResult {
  text: string;
  /** Token counts for usage/cost tracking (0 when unknown). */
  inputTokens: number;
  outputTokens: number;
}

export interface AiProvider {
  id: ProviderId;
  label: string;
  model: string;
  generate(req: AiRequest): Promise<AiResult>;
}

/** An error whose message is safe to show in the dashboard. */
export class AiError extends Error {
  constructor(message: string, readonly status = 502) {
    super(message);
  }
}
