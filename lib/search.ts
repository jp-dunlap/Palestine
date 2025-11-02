// Minimal search types + placeholder functions (we'll wire Lunr/MiniSearch later)

import type { SearchDoc } from '@/lib/search.types';

export type { SearchDoc };

export type SearchResult = {
  doc: SearchDoc;
  score: number;         // 0..1 (placeholder for now)
};

// TODO: replace with real indexer (lunr or minisearch)
export function queryLocal(_docs: SearchDoc[], _q: string): SearchResult[] {
  return [];
}
