import { afterEach, describe, expect, it, vi } from 'vitest';
import { normalizeSearchDocs } from '@/lib/search-normalize';

const noop = () => {};

describe('normalizeSearchDocs', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('derives ids from slug and href when missing', () => {
    const docs = normalizeSearchDocs(
      [
        { slug: 'chapter-1', title: 'Chapter 1', href: '/chapters/chapter-1' },
        { href: '/timeline#event-1', title: 'Event 1' },
      ],
      'en'
    );

    expect(docs).toHaveLength(2);
    expect(docs[0]).toMatchObject({
      id: 'chapter-1',
      href: '/chapters/chapter-1',
      title: 'Chapter 1',
      lang: 'en',
    });
    expect(docs[1]).toMatchObject({
      id: '/timeline#event-1',
      href: '/timeline#event-1',
      title: 'Event 1',
      lang: 'en',
    });
  });

  it('skips duplicate ids and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    const docs = normalizeSearchDocs(
      [
        { id: 'dup', title: 'One', href: '/chapters/one' },
        { id: 'dup', title: 'Two', href: '/chapters/two' },
      ],
      'en'
    );

    expect(warn).toHaveBeenCalled();
    expect(docs).toHaveLength(1);
    expect(docs[0].href).toBe('/chapters/one');
  });

  it('falls back to deterministic ids when none provided', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(noop);
    const docs = normalizeSearchDocs(
      [
        { title: 'Untitled doc' },
        { title: 'Another' },
      ],
      'ar'
    );

    expect(warn).not.toHaveBeenCalledWith('[search] duplicate id, skipping', expect.anything(), expect.anything());
    expect(docs).toHaveLength(2);
    expect(docs[0].id).toBe('anon-0');
    expect(docs[0].href).toBe('/');
    expect(docs[0].lang).toBe('ar');
  });
});
