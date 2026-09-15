import { AiError, type AiProvider } from "./types";

// Groq (fast open-source models). Free API key: https://console.groq.com/keys
export function groqProvider(apiKey: string): AiProvider {
  // Qwen follows the customer's language (Roman Urdu stays Roman Urdu) and uses few tokens.
  // Free plan: 1,000 requests/day and 8,000 tokens/minute per model.
  const model = process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
  return {
    id: "groq",
    label: "Groq",
    model,
    async generate({ system, messages }) {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.4,
          // Groq counts max_tokens against its output-tokens-per-minute limit (1,000 on the free plan),
          // so keep it small; chat replies are short.
          max_tokens: 512,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const detail = data?.error?.message ?? res.statusText;
        throw new AiError(`Groq error (${res.status}): ${detail}`, res.status === 429 ? 429 : 502);
      }
      // Reasoning models can include their thinking in <think> tags; customers should only see the answer.
      const text = String(data?.choices?.[0]?.message?.content ?? "")
        .replace(/<think>[\s\S]*?(<\/think>|$)/g, "")
        .trim();
      if (!text) throw new AiError("Groq returned an empty answer.");
      return {
        text,
        inputTokens: Number(data?.usage?.prompt_tokens ?? 0),
        outputTokens: Number(data?.usage?.completion_tokens ?? 0),
      };
    },
  };
}
