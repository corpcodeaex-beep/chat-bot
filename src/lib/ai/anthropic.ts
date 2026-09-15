import Anthropic from "@anthropic-ai/sdk";
import { AiError, type AiProvider } from "./types";

// Anthropic Claude. Paid API key: https://console.anthropic.com
export function anthropicProvider(apiKey: string): AiProvider {
  const client = new Anthropic({ apiKey });
  const model = process.env.CLAUDE_MODEL || "claude-opus-5";
  return {
    id: "anthropic",
    label: "Anthropic Claude",
    model,
    async generate({ system, messages }) {
      try {
        const response = await client.beta.messages.create({
          model,
          max_tokens: 16000,
          // Chat is latency-sensitive: start the visible reply straight away.
          system: `${system}\n\nLatency-sensitive; begin your visible answer immediately.`,
          messages,
          // If Claude declines a message, the API retries it on Anthropic's recommended fallback model.
          betas: ["server-side-fallback-2026-07-01"],
          fallbacks: "default",
        });
        if (response.stop_reason === "refusal") {
          throw new AiError("Claude declined to answer this message.", 422);
        }
        const text = response.content
          .flatMap((block) => (block.type === "text" ? [block.text] : []))
          .join("")
          .trim();
        if (!text) throw new AiError("Claude returned an empty answer.");
        return { text, inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens };
      } catch (error) {
        if (error instanceof AiError) throw error;
        if (error instanceof Anthropic.AuthenticationError) throw new AiError("Claude API key is invalid.", 401);
        if (error instanceof Anthropic.RateLimitError) throw new AiError("Claude rate limit reached, try again shortly.", 429);
        if (error instanceof Anthropic.APIError) throw new AiError(`Claude error (${error.status}): ${error.message}`);
        throw error;
      }
    },
  };
}
