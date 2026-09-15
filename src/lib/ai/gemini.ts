import { AiError, type AiProvider } from "./types";

// Google Gemini. Free API key (no card): https://aistudio.google.com/apikey
export function geminiProvider(apiKey: string): AiProvider {
  // The lite model is fast, uses few tokens and has more generous free limits; plenty for customer chat.
  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
  return {
    id: "gemini",
    label: "Google Gemini",
    model,
    async generate({ system, messages }) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
          // Thinking tokens count toward the output limit; "low" keeps chat replies fast.
          generationConfig: { maxOutputTokens: 4096, thinkingConfig: { thinkingLevel: "low" } },
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const detail = data?.error?.message ?? res.statusText;
        throw new AiError(`Gemini error (${res.status}): ${detail}`, res.status === 429 ? 429 : 502);
      }
      const parts: { text?: string; thought?: boolean }[] = data?.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .filter((p) => !p.thought)
        .map((p) => p.text ?? "")
        .join("")
        .trim();
      if (!text) throw new AiError("Gemini returned an empty answer (it may have been blocked by its safety filter).");
      const usage = data?.usageMetadata ?? {};
      return {
        text,
        inputTokens: Number(usage.promptTokenCount ?? 0),
        outputTokens: Number(usage.candidatesTokenCount ?? 0) + Number(usage.thoughtsTokenCount ?? 0),
      };
    },
  };
}
