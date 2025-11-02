import { describe, expect, it } from 'vitest';
import { queryLocal } from '@/lib/search';
import type { SearchDoc } from '@/lib/search.types';

describe('queryLocal ranking', () => {
  const docs: SearchDoc[] = [
    {
      id: '/places/haifa',
      title: 'Haifa',
      summary: 'Place in northern Palestine',
      tags: ['Palestine', 'Coastal city'],
      href: '/places/haifa',
      type: 'place',
    },
    {
      id: '/timeline/haifa-street',
      title: 'Haifa Street Protest',
      summary: 'Mass uprising in Baghdad inspired by Palestinian resistance',
      tags: ['protest'],
      href: '/timeline/haifa-street',
      type: 'event',
    },
    {
      id: '/chapters/haifa-memory',
      title: 'Memory of Haifa',
      summary: 'Chapter on Haifa diaspora stories',
      tags: ['memory'],
      href: '/chapters/haifa-memory',
      type: 'chapter',
    },
  ];

  it('boosts exact title matches over partial matches', () => {
    const results = queryLocal(docs, 'Haifa');
    expect(results[0]?.doc.id).toBe('/places/haifa');
    expect(results.map((entry) => entry.doc.id)).toContain('/timeline/haifa-street');
  });

  it('filters by document type', () => {
    const results = queryLocal(docs, 'Haifa', { types: ['place'] });
    expect(results.length).toBe(1);
    expect(results[0]?.doc.type).toBe('place');
  });
});
