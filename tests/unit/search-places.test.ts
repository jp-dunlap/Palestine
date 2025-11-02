import { describe, expect, it } from 'vitest';
import { loadPlaceDocs, SearchDoc } from '../../scripts/build-search.js';

function findDoc(docs: SearchDoc[], href: string) {
  return docs.find((doc) => doc.href === href);
}

describe('search place indexing', () => {
  it('includes places with alternate names in the search index', async () => {
    const docs = await loadPlaceDocs();
    const haifa = findDoc(docs, '/places/haifa');
    expect(haifa).toBeTruthy();
    expect(haifa?.type).toBe('place');
    expect(Array.isArray(haifa?.tags)).toBe(true);
    expect(haifa?.tags.includes('حيفا')).toBe(true);
  });

  it('includes arabic variants when available', async () => {
    const docs = await loadPlaceDocs();
    const haifaAr = findDoc(docs, '/ar/places/haifa');
    expect(haifaAr).toBeTruthy();
    expect(haifaAr?.lang).toBe('ar');
  });
});
