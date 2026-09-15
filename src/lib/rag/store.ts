import { db, iso, opt, type Row } from "../sql";
import type { KnowledgeChunk, KnowledgeSource } from "./types";

// Knowledge storage in Postgres: keyword search uses a tsvector column,
// meaning search uses pgvector.

const INSERT_BATCH = 100;

const toSource = (r: Row): KnowledgeSource => ({
  id: String(r.id),
  type: r.type as KnowledgeSource["type"],
  name: String(r.name),
  url: opt(r.url),
  pages: r.pages === null || r.pages === undefined ? undefined : Number(r.pages),
  chars: Number(r.chars),
  chunkCount: Number(r.chunk_count),
  embedded: Boolean(r.embedded),
  warning: opt(r.warning),
  createdAt: iso(r.created_at),
});

const vectorLiteral = (v: number[] | undefined) => (v ? `[${v.join(",")}]` : null);

export async function listSources(botId: string) {
  const sql = await db();
  return (await sql.query("SELECT * FROM knowledge_sources WHERE bot_id = $1 ORDER BY created_at", [botId])).map(toSource);
}

/**
 * Saves a new source with its chunks. `tokens` holds the normalized search words of each chunk.
 * Existing sources matching `replaces` (e.g. same file name) are removed once the new one is saved.
 */
export async function addSource(
  botId: string,
  source: KnowledgeSource,
  chunks: (KnowledgeChunk & { tokens: string })[],
  replaces: (existing: KnowledgeSource) => boolean,
) {
  const sql = await db();
  const oldIds = (await listSources(botId)).filter(replaces).map((s) => s.id);

  await sql.query(
    `INSERT INTO knowledge_sources (id, bot_id, type, name, url, pages, chars, chunk_count, embedded, warning)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [source.id, botId, source.type, source.name, source.url ?? null, source.pages ?? null, source.chars, source.chunkCount, source.embedded, source.warning ?? null],
  );
  try {
    for (let i = 0; i < chunks.length; i += INSERT_BATCH) {
      const batch = chunks.slice(i, i + INSERT_BATCH);
      await sql.query(
        `INSERT INTO knowledge_chunks (id, source_id, bot_id, heading, text, search_tsv, embedding)
         SELECT c.id, $1, $2, c.heading, c.text, to_tsvector('simple', c.tokens), c.embedding::vector
         FROM unnest($3::text[], $4::text[], $5::text[], $6::text[], $7::text[]) AS c(id, heading, text, tokens, embedding)`,
        [
          source.id,
          botId,
          batch.map((c) => c.id),
          batch.map((c) => c.heading ?? null),
          batch.map((c) => c.text),
          batch.map((c) => c.tokens),
          batch.map((c) => vectorLiteral(c.embedding)),
        ],
      );
    }
  } catch (error) {
    await sql.query("DELETE FROM knowledge_sources WHERE id = $1", [source.id]);
    throw error;
  }
  if (oldIds.length) await sql.query("DELETE FROM knowledge_sources WHERE id = ANY($1::text[])", [oldIds]);
  return source;
}

export async function removeSource(botId: string, sourceId: string) {
  const sql = await db();
  return (await sql.query("DELETE FROM knowledge_sources WHERE id = $1 AND bot_id = $2 RETURNING id", [sourceId, botId])).length > 0;
}

export async function chunksWithoutEmbedding(botId: string) {
  const sql = await db();
  const rows = await sql.query("SELECT id, heading, text FROM knowledge_chunks WHERE bot_id = $1 AND embedding IS NULL", [botId]);
  return rows.map((r) => ({ id: String(r.id), heading: opt(r.heading), text: String(r.text) }));
}

export async function setEmbeddings(botId: string, vectors: Map<string, number[]>) {
  const sql = await db();
  const entries = [...vectors];
  for (let i = 0; i < entries.length; i += INSERT_BATCH) {
    const batch = entries.slice(i, i + INSERT_BATCH);
    await sql.query(
      `UPDATE knowledge_chunks k SET embedding = v.embedding::vector
       FROM unnest($1::text[], $2::text[]) AS v(id, embedding)
       WHERE k.id = v.id AND k.bot_id = $3`,
      [batch.map(([id]) => id), batch.map(([, v]) => vectorLiteral(v)), botId],
    );
  }
  await sql.query(
    `UPDATE knowledge_sources s SET
       embedded = NOT EXISTS (SELECT 1 FROM knowledge_chunks c WHERE c.source_id = s.id AND c.embedding IS NULL),
       warning = CASE WHEN warning LIKE 'Smart search%' THEN NULL ELSE warning END
     WHERE s.bot_id = $1`,
    [botId],
  );
}

/** Top chunks by keyword relevance. `terms` must be plain letters/digits (from tokenize). */
export async function keywordSearch(botId: string, terms: string[], limit: number) {
  if (!terms.length) return [];
  const sql = await db();
  const rows = await sql.query(
    `SELECT id, ts_rank(search_tsv, q, 1) AS score
     FROM knowledge_chunks, to_tsquery('simple', $1) q
     WHERE bot_id = $2 AND search_tsv @@ q
     ORDER BY score DESC LIMIT $3`,
    [terms.join(" | "), botId, limit],
  );
  return rows.map((r) => ({ id: String(r.id), score: Number(r.score) }));
}

/** Top chunks by meaning (cosine similarity). */
export async function vectorSearch(botId: string, vector: number[], limit: number) {
  const sql = await db();
  const rows = await sql.query(
    `SELECT id, 1 - (embedding <=> $1::vector) AS score
     FROM knowledge_chunks
     WHERE bot_id = $2 AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector LIMIT $3`,
    [vectorLiteral(vector), botId, limit],
  );
  return rows.map((r) => ({ id: String(r.id), score: Number(r.score) }));
}

export async function hasEmbeddings(botId: string) {
  const sql = await db();
  const [row] = await sql.query("SELECT EXISTS (SELECT 1 FROM knowledge_chunks WHERE bot_id = $1 AND embedding IS NOT NULL) AS has", [botId]);
  return Boolean(row?.has);
}

export interface DocumentCounts {
  /** Files + pasted texts + website pages (every imported web page is one document). */
  documents: number;
  files: number;
  texts: number;
  websites: number;
  websitePages: number;
}

export const EMPTY_DOCUMENT_COUNTS: DocumentCounts = { documents: 0, files: 0, texts: 0, websites: 0, websitePages: 0 };

/** Document counts per bot (all bots, or the given ones). */
export async function getDocumentCounts(botIds?: string[]) {
  const sql = await db();
  const rows = await sql.query(
    `SELECT bot_id,
       count(*) FILTER (WHERE type = 'file')::int AS files,
       count(*) FILTER (WHERE type = 'text')::int AS texts,
       count(*) FILTER (WHERE type = 'website')::int AS websites,
       COALESCE(sum(COALESCE(pages, 1)) FILTER (WHERE type = 'website'), 0)::int AS website_pages
     FROM knowledge_sources
     WHERE ($1::text[] IS NULL OR bot_id = ANY($1::text[]))
     GROUP BY bot_id`,
    [botIds ?? null],
  );
  return new Map<string, DocumentCounts>(
    rows.map((r) => {
      const files = Number(r.files);
      const texts = Number(r.texts);
      const websitePages = Number(r.website_pages);
      return [String(r.bot_id), { files, texts, websites: Number(r.websites), websitePages, documents: files + texts + websitePages }];
    }),
  );
}

export async function getChunks(ids: string[]) {
  if (!ids.length) return [];
  const sql = await db();
  const rows = await sql.query(
    `SELECT c.id, c.heading, c.text, s.name AS source_name
     FROM knowledge_chunks c JOIN knowledge_sources s ON s.id = c.source_id
     WHERE c.id = ANY($1::text[])`,
    [ids],
  );
  return rows.map((r) => ({ id: String(r.id), heading: opt(r.heading), text: String(r.text), sourceName: String(r.source_name) }));
}
