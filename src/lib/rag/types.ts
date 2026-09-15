export type SourceType = "file" | "website" | "text";

/** One imported document, website or pasted text. */
export interface KnowledgeSource {
  id: string;
  type: SourceType;
  name: string;
  url?: string;
  pages?: number;
  chars: number;
  chunkCount: number;
  /** True when every chunk has an embedding for meaning-based search. */
  embedded: boolean;
  warning?: string;
  createdAt: string;
}

/** A small searchable piece of a source. */
export interface KnowledgeChunk {
  id: string;
  sourceId: string;
  heading?: string;
  text: string;
  embedding?: number[];
}

export interface KnowledgeIndex {
  sources: KnowledgeSource[];
  chunks: KnowledgeChunk[];
}

export interface SearchHit {
  sourceName: string;
  heading?: string;
  text: string;
  score: number;
  /** Which search found it. */
  via: "keywords" | "meaning" | "both";
}
