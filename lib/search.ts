// Minimal search types + placeholder functions (we'll wire Lunr/MiniSearch later)

export type SearchDoc = {
  id: string;
  kind: 'chapter' | 'timeline' | 'place';
  title: string;
  slug?: string;         // for chapters
  summary?: string;
  tags?: string[];
};

export type SearchResult = {
  doc: SearchDoc;
  score: number;         // 0..1 (placeholder for now)
};

// TODO: replace with real indexer (lunr or minisearch)
export function queryLocal(_docs: SearchDoc[], _q: string): SearchResult[] {
  return [];
}
