// Meaning-based search uses Gemini embeddings (free with the same GEMINI_API_KEY).
// Without a key, search falls back to keywords only.

const MODEL = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-001";
const DIMENSIONS = 768;
const BATCH = 100;

export type EmbedTask = "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY";

export function embeddingsAvailable() {
  return !!process.env.GEMINI_API_KEY;
}

function normalize(vector: number[]) {
  const norm = Math.sqrt(vector.reduce((s, v) => s + v * v, 0)) || 1;
  // 4 decimals keeps files small with no real loss in search quality.
  return vector.map((v) => Math.round((v / norm) * 1e4) / 1e4);
}

export async function embedTexts(texts: string[], task: EmbedTask): Promise<number[][]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not set");
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i += BATCH) {
    const batch = texts.slice(i, i + BATCH);
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:batchEmbedContents`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        requests: batch.map((text) => ({
          model: `models/${MODEL}`,
          content: { parts: [{ text: text.slice(0, 8000) }] },
          taskType: task,
          outputDimensionality: DIMENSIONS,
        })),
      }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(`Gemini embeddings error (${res.status}): ${data?.error?.message ?? res.statusText}`);
    const embeddings: { values: number[] }[] = data?.embeddings ?? [];
    if (embeddings.length !== batch.length) throw new Error("Gemini returned the wrong number of embeddings");
    out.push(...embeddings.map((e) => normalize(e.values)));
  }
  return out;
}

const queryCache = new Map<string, number[]>();

export async function embedQuery(query: string): Promise<number[]> {
  const cached = queryCache.get(query);
  if (cached) return cached;
  const [vector] = await embedTexts([query], "RETRIEVAL_QUERY");
  if (queryCache.size > 500) queryCache.clear();
  queryCache.set(query, vector);
  return vector;
}
