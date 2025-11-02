import { describe, expect, it } from 'vitest';
const loadPlaceDocs = async () => {
  const mod = await import('../../scripts/build-search.js');
  const fn = (mod as Record<string, unknown>).loadPlaceDocs;
  if (typeof fn !== 'function') {
    throw new Error('loadPlaceDocs export is missing from build-search.js');
  }
  return fn();
};

function findDoc(docs: Array<Record<string, unknown>>, href: string) {
  return docs.find((doc) => doc && typeof doc === 'object' && doc.href === href);
}

describe('search place indexing', () => {
  it('includes places with alternate names in the search index', async () => {
    const docs = await loadPlaceDocs();
    const haifa = findDoc(docs, '/places/haifa');
    expect(haifa).toBeTruthy();
    expect(haifa?.type).toBe('place');
    expect(Array.isArray(haifa?.tags)).toBe(true);
    expect((haifa?.tags as string[]).includes('حيفا')).toBe(true);
  });

  it('includes arabic variants when available', async () => {
    const docs = await loadPlaceDocs();
    const haifaAr = findDoc(docs, '/ar/places/haifa');
    expect(haifaAr).toBeTruthy();
    expect(haifaAr?.lang).toBe('ar');
  });

  it('deduplicates place tags across locales', async () => {
    const docs = await loadPlaceDocs();
    const haifaAr = findDoc(docs, '/ar/places/haifa');
    expect(haifaAr).toBeTruthy();
    const tags = Array.isArray(haifaAr?.tags) ? (haifaAr?.tags as string[]) : [];
    expect(new Set(tags).size).toBe(tags.length);
  });
});
