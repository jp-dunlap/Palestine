import { describe, expect, it } from 'vitest';
import { applyEraFilter } from '@/lib/timeline/filters';
import type { Era, TimelineEvent } from '@/lib/types';

describe('applyEraFilter', () => {
  const eras: Era[] = [
    { id: 'nakba', title: 'Nakba', start: 1947, end: 1949 },
    { id: 'modern', title: 'Modern', start: 1800, end: null },
  ];

  const events: TimelineEvent[] = [
    {
      id: 'event-nakba',
      title: 'Nakba',
      start: 1948,
      end: 1949,
      places: [],
      sources: [],
      summary: '',
      tags: [],
      certainty: 'high',
      era: 'nakba',
    },
    {
      id: 'event-overlap',
      title: 'Overlapping years',
      start: 1947,
      end: 1950,
      places: [],
      sources: [],
      summary: '',
      tags: [],
      certainty: 'medium',
      era: 'modern',
    },
    {
      id: 'event-modern',
      title: 'Modern only',
      start: 1960,
      end: 1965,
      places: [],
      sources: [],
      summary: '',
      tags: [],
      certainty: 'medium',
      era: 'modern',
    },
  ];

  it('returns original events when no eras selected', () => {
    const filtered = applyEraFilter(events, { eraIds: [], eras, logic: 'or' });
    expect(filtered).toEqual(events);
  });

  it('matches events whose ranges overlap the Nakba era', () => {
    const filtered = applyEraFilter(events, { eraIds: ['nakba'], eras, logic: 'or' });
    expect(filtered.map((event) => event.id)).toEqual(['event-nakba', 'event-overlap']);
  });

  it('respects AND logic when multiple eras selected', () => {
    const filtered = applyEraFilter(events, { eraIds: ['nakba', 'modern'], eras, logic: 'and' });
    expect(filtered.map((event) => event.id)).toEqual(['event-nakba', 'event-overlap']);
  });
});
