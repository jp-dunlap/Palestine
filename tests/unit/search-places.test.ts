import { describe, expect, it } from 'vitest';
import { loadPlaceDocs } from '../../scripts/build-search.js';

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
});
