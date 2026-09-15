import { AiError, type AiProvider } from "./types";

// Groq (fast open-source models). Free API key: https://console.groq.com/keys
export function groqProvider(apiKey: string): AiProvider {
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
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
          max_tokens: 2048,
          messages: [{ role: "system", content: system }, ...messages],
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const detail = data?.error?.message ?? res.statusText;
        throw new AiError(`Groq error (${res.status}): ${detail}`, res.status === 429 ? 429 : 502);
      }
      const text = String(data?.choices?.[0]?.message?.content ?? "").trim();
      if (!text) throw new AiError("Groq returned an empty answer.");
      return {
        text,
        inputTokens: Number(data?.usage?.prompt_tokens ?? 0),
        outputTokens: Number(data?.usage?.completion_tokens ?? 0),
      };
    },
  };
}
