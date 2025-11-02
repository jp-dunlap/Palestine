import MiniSearch from 'minisearch';
import type { SearchDoc } from '@/lib/search.types';

export type { SearchDoc };

export type SearchResult = {
  doc: SearchDoc;
  score: number;
};

export type SearchIndex = {
  mini: MiniSearch<SearchDoc>;
  docs: SearchDoc[];
  docById: Map<string, SearchDoc>;
};

export type QueryOptions = {
  limit?: number;
  types?: Array<NonNullable<SearchDoc['type']>>;
};

function normaliseDocs(docs: SearchDoc[]): SearchDoc[] {
  return docs
    .filter((doc) => doc && typeof doc.id === 'string' && doc.id.trim())
    .map((doc) => ({
      ...doc,
      id: doc.id.trim(),
      title: doc.title ?? '',
      summary: doc.summary,
      tags: Array.isArray(doc.tags) ? doc.tags.map(String) : [],
    }));
}

export function buildSearchIndex(docs: SearchDoc[]): SearchIndex {
  const normalised = normaliseDocs(docs);
  const mini = new MiniSearch<SearchDoc>({
    idField: 'id',
    fields: ['title', 'summary', 'tags'],
    storeFields: ['id', 'title', 'summary', 'tags', 'href', 'type', 'lang'],
    searchOptions: {
      boost: { title: 6, summary: 2, tags: 1 },
      combineWith: 'AND',
      prefix: true,
      fuzzy: 0.15,
    },
  });

  try {
    mini.addAll(normalised);
  } catch (err) {
    console.error('[search] indexing failed:', err);
  }

  return {
    mini,
    docs: normalised,
    docById: new Map(normalised.map((doc) => [doc.id, doc])),
  };
}

function matchesType(doc: SearchDoc, types?: Array<NonNullable<SearchDoc['type']>>): boolean {
  if (!types || types.length === 0) return true;
  if (!doc.type) return false;
  return types.includes(doc.type);
}

function boostScore(doc: SearchDoc, query: string, baseScore: number): number {
  const q = query.toLowerCase();
  const title = (doc.title ?? '').toLowerCase();
  const summary = (doc.summary ?? '').toLowerCase();
  const tags = Array.isArray(doc.tags) ? doc.tags.map((tag) => tag.toLowerCase()) : [];

  let bonus = 0;
  if (title === q) {
    return baseScore + 100;
  } else if (title.startsWith(`${q} `)) {
    bonus += 3;
  } else if (title.includes(q)) {
    bonus += 2;
  }
  if (summary.includes(q)) bonus += 0.75;
  if (tags.includes(q)) bonus += 1;

  return baseScore + bonus;
}

export function searchIndex(
  index: SearchIndex,
  query: string,
  options?: QueryOptions
): SearchResult[] {
  const trimmed = query.trim();
  const limit = Math.max(1, options?.limit ?? 20);
  const wantedTypes = options?.types?.filter(Boolean);

  if (!trimmed) {
    const filtered = index.docs.filter((doc) => matchesType(doc, wantedTypes));
    return filtered.slice(0, limit).map((doc) => ({ doc, score: 0 }));
  }

  const seen = new Set<string>();
  const results: SearchResult[] = [];

  const hits = index.mini.search(trimmed);
  for (const hit of hits) {
    const id = typeof hit.id === 'string' ? hit.id : String(hit.id);
    if (seen.has(id)) continue;
    const doc = index.docById.get(id);
    if (!doc) continue;
    if (!matchesType(doc, wantedTypes)) continue;

    const score = boostScore(doc, trimmed, typeof hit.score === 'number' ? hit.score : 0);
    results.push({ doc, score });
    seen.add(id);
    if (results.length >= limit) break;
  }

  return results.sort((a, b) => b.score - a.score);
}

export function queryLocal(
  docs: SearchDoc[],
  query: string,
  options?: QueryOptions
): SearchResult[] {
  if (!docs.length) return [];
  const index = buildSearchIndex(docs);
  return searchIndex(index, query, options);
}
