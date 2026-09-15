import { newId } from "../db";
import { chunkText } from "./chunk";
import { embeddingsAvailable, embedTexts } from "./embed";
import { tokenize } from "./search";
import { addSource, chunksWithoutEmbedding, setEmbeddings } from "./store";
import type { KnowledgeChunk, KnowledgeSource, SourceType } from "./types";

export interface Section {
  heading?: string;
  text: string;
}

interface SourceInfo {
  type: SourceType;
  name: string;
  url?: string;
  pages?: number;
  warning?: string;
}

const embeddingInput = (c: { heading?: string; text: string }) => (c.heading ? `${c.heading}\n${c.text}` : c.text);

/** Chunks the text, prepares meaning search if possible, and saves it as one source. */
export async function ingest(
  botId: string,
  info: SourceInfo,
  sections: Section[],
  replaces: (existing: KnowledgeSource) => boolean,
): Promise<KnowledgeSource> {
  const sourceId = newId();
  const chunks: (KnowledgeChunk & { tokens: string })[] = sections.flatMap((section) =>
    chunkText(section.text).map((text) => ({
      id: newId(),
      sourceId,
      heading: section.heading,
      text,
      tokens: tokenize(`${section.heading ?? ""} ${text}`).join(" "),
    })),
  );
  if (!chunks.length) throw new Error("No readable text was found.");

  let embedded = false;
  let warning = info.warning;
  if (embeddingsAvailable()) {
    try {
      const vectors = await embedTexts(chunks.map(embeddingInput), "RETRIEVAL_DOCUMENT");
      chunks.forEach((chunk, i) => (chunk.embedding = vectors[i]));
      embedded = true;
    } catch (error) {
      warning = [warning, `Smart search could not be prepared (${(error as Error).message}). Keyword search still works; press Re-index later.`]
        .filter(Boolean)
        .join(" ");
    }
  }

  const source: KnowledgeSource = {
    id: sourceId,
    type: info.type,
    name: info.name,
    url: info.url,
    pages: info.pages,
    chars: sections.reduce((n, s) => n + s.text.length, 0),
    chunkCount: chunks.length,
    embedded,
    warning,
    createdAt: new Date().toISOString(),
  };
  return addSource(botId, source, chunks, replaces);
}

/** Adds embeddings to chunks that don't have them yet (e.g. imported before a Gemini key was set). */
export async function reindex(botId: string) {
  if (!embeddingsAvailable()) throw new Error("Add GEMINI_API_KEY to .env.local to enable smart search.");
  const missing = await chunksWithoutEmbedding(botId);
  if (!missing.length) return { embedded: 0 };
  const vectors = await embedTexts(missing.map(embeddingInput), "RETRIEVAL_DOCUMENT");
  await setEmbeddings(botId, new Map(missing.map((c, i) => [c.id, vectors[i]])));
  return { embedded: missing.length };
}
