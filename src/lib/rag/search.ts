import { embeddingsAvailable, embedQuery } from "./embed";
import { getChunks, hasEmbeddings, keywordSearch, vectorSearch } from "./store";
import type { SearchHit } from "./types";

// Hybrid retrieval: Postgres full-text keyword ranking (always available) fused
// with pgvector similarity (when a Gemini key is set) via reciprocal rank fusion.

const STOP_WORDS = new Set(
  (
    "a an the is are was were be been to of in on for and or with at by from it its this that these those what which who how " +
    "do does did can could i you we he she they me my your our their please tell about any have has had will would should " +
    "hai hain ka ki ke ko se kya aap ap mein main mai hum tum yeh ye woh wo koi kuch bhi aur ya par pe tak kitna kitni kitne " +
    "batao bataen bataye chahiye hota hoti ho raha rahi"
  ).split(" "),
);

const RRF_K = 60;
const CANDIDATES = 30;
const MIN_SIMILARITY = 0.5;

function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

/** Normalized search words. Used both when saving chunks and when searching, so they match. */
export function tokenize(text: string): string[] {
  return (text.toLowerCase().normalize("NFKC").match(/[\p{L}\p{N}]+/gu) ?? [])
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w))
    .map(stem);
}

async function meaningRank(botId: string, query: string) {
  if (!embeddingsAvailable() || !(await hasEmbeddings(botId))) return [];
  try {
    const results = await vectorSearch(botId, await embedQuery(query), CANDIDATES);
    return results.filter((r) => r.score >= MIN_SIMILARITY);
  } catch (error) {
    console.warn("[rag] meaning search unavailable, using keywords only:", (error as Error).message);
    return [];
  }
}

export async function searchKnowledge(botId: string, query: string, limit = 6): Promise<SearchHit[]> {
  if (!query.trim()) return [];
  const terms = [...new Set(tokenize(query))].slice(0, 30);
  const [keywords, meaning] = await Promise.all([keywordSearch(botId, terms, CANDIDATES), meaningRank(botId, query)]);

  const fused = new Map<string, { score: number; keywords: boolean; meaning: boolean }>();
  const add = (list: { id: string }[], kind: "keywords" | "meaning") =>
    list.forEach(({ id }, rank) => {
      const entry = fused.get(id) ?? { score: 0, keywords: false, meaning: false };
      fused.set(id, { ...entry, score: entry.score + 1 / (RRF_K + rank), [kind]: true });
    });
  add(keywords, "keywords");
  add(meaning, "meaning");

  const top = [...fused.entries()].sort((a, b) => b[1].score - a[1].score).slice(0, limit);
  const chunks = new Map((await getChunks(top.map(([id]) => id))).map((c) => [c.id, c]));
  return top.flatMap(([id, r]) => {
    const chunk = chunks.get(id);
    if (!chunk) return [];
    return [
      {
        sourceName: chunk.sourceName,
        heading: chunk.heading,
        text: chunk.text,
        score: Math.round(r.score * 1e4) / 1e4,
        via: r.keywords && r.meaning ? "both" : r.meaning ? "meaning" : "keywords",
      } satisfies SearchHit,
    ];
  });
}
