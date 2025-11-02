import { describe, expect, it } from 'vitest';
import {
  filterTimeline,
  getTimelineEventById,
  loadEras,
  loadTimelineEvents,
  requireYearNumber,
  toYearNumber,
} from '@/lib/loaders.timeline';

const hasArabic = (value: string) => /[\u0600-\u06FF]/.test(value);

describe('toYearNumber', () => {
  it('parses numbers and strings', () => {
    expect(toYearNumber(1993)).toBe(1993);
    expect(toYearNumber('1993')).toBe(1993);
    expect(toYearNumber('-1200')).toBe(-1200);
  });

  it('returns null for empty values', () => {
    expect(toYearNumber(null)).toBeNull();
    expect(toYearNumber('')).toBeNull();
    expect(toYearNumber(undefined)).toBeNull();
  });

  it('throws for invalid input', () => {
    expect(() => toYearNumber('nineteen')).toThrowError();
  });
});

describe('requireYearNumber', () => {
  it('returns a valid year', () => {
    expect(requireYearNumber('1948', 'test')).toBe(1948);
  });

  it('throws when value missing', () => {
    expect(() => requireYearNumber('', 'test')).toThrowError();
  });
});

describe('loadEras', () => {
  const eras = loadEras();

  it('sorts eras by start year', () => {
    const starts = eras.map((era) => era.start);
    const sorted = [...starts].sort((a, b) => a - b);
    expect(starts).toEqual(sorted);
  });

  it('ensures start is not after end', () => {
    for (const era of eras) {
      if (era.end != null) {
        expect(era.start).toBeLessThanOrEqual(era.end);
      }
    }
  });
});

describe('filterTimeline', () => {
  it('returns all events when no filters applied', () => {
    const events = filterTimeline({});
    expect(events.length).toBeGreaterThan(0);
  });

  it('filters by full-text query', () => {
    const events = filterTimeline({ q: 'arab revolt' });
    expect(events.some((event) => event.id === 'arab-revolt-1936-39')).toBe(true);
  });

  it('filters by era', () => {
    const events = filterTimeline({ eras: ['modern'] });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => event.era === 'modern')).toBe(true);
  });

  it('filters by tags', () => {
    const events = filterTimeline({ tags: ['massacre'] });
    expect(events.some((event) => event.id === 'deir-yassin-1948')).toBe(true);
    expect(events.every((event) => event.tags.includes('massacre'))).toBe(true);
  });

  it('filters by places', () => {
    const events = filterTimeline({ places: ['Gaza'] });
    expect(events.some((event) => event.places.includes('Gaza'))).toBe(true);
  });

  it('localises Arabic content', () => {
    const events = filterTimeline({ q: 'ثورة', locale: 'ar' });
    const target = events.find((event) => event.id === 'arab-revolt-1936-39');
    expect(target).toBeDefined();
    expect(target?.title).toSatisfy((title: string) => hasArabic(title));
  });
});

describe('getTimelineEventById', () => {
  it('returns a matching event', () => {
    const event = getTimelineEventById('arab-revolt-1936-39');
    expect(event).not.toBeNull();
    expect(event?.title).toBe('The 1936–39 Arab Revolt');
  });

  it('returns Arabic localisation', () => {
    const event = getTimelineEventById('arab-revolt-1936-39', { locale: 'ar' });
    expect(event).not.toBeNull();
    expect(event?.title).toSatisfy((title: string) => hasArabic(title));
  });

  it('returns null for unknown ids', () => {
    expect(getTimelineEventById('not-real')).toBeNull();
  });
});

describe('loadTimelineEvents', () => {
  it('deduplicates ids across data sources', () => {
    const ids = loadTimelineEvents().map((event) => event.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
