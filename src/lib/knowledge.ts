// Picks the parts of a business's knowledge that match the customer's question.
// Small knowledge bases are sent whole; big ones are split into chunks and
// ranked by word overlap. Works with every AI provider (no embeddings needed).

const SEND_WHOLE_LIMIT = 8000;
const CHUNK_SIZE = 900;

const STOP_WORDS = new Set(
  "a an the is are was were be to of in on for and or with at by from it this that what how do does can i you we me my your our please hai hain ka ki ke ko se kya aap mein main hum".split(
    " ",
  ),
);

function words(text: string): string[] {
  return (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []).filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

export function chunkKnowledge(knowledge: string): string[] {
  const blocks = knowledge.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const block of blocks) {
    if (current && current.length + block.length > CHUNK_SIZE) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current}\n\n${block}` : block;
  }
  if (current) chunks.push(current);
  return chunks;
}

export function rankChunks(knowledge: string, query: string, limit = 5): string[] {
  const queryWords = new Set(words(query));
  return chunkKnowledge(knowledge)
    .map((chunk, index) => {
      const chunkWords = words(chunk);
      const score = chunkWords.reduce((s, w) => s + (queryWords.has(w) ? 1 : 0), 0) / Math.sqrt(chunkWords.length + 1);
      return { chunk, index, score };
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .sort((a, b) => a.index - b.index)
    .map((c) => c.chunk);
}

export function relevantKnowledge(knowledge: string, query: string): string {
  if (knowledge.length <= SEND_WHOLE_LIMIT) return knowledge;
  const ranked = rankChunks(knowledge, query);
  // Always include the first chunk: it usually has the business overview/contact info.
  const first = chunkKnowledge(knowledge)[0] ?? "";
  return [first, ...ranked.filter((c) => c !== first)].join("\n\n---\n\n");
}
