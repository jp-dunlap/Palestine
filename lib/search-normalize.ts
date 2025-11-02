import type { SearchDoc } from '@/lib/search.types';

type RawDoc = Record<string, unknown>;

type Locale = 'en' | 'ar' | undefined;

function normaliseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => String(tag));
}

function pickType(value: unknown): SearchDoc['type'] | undefined {
  if (value === 'chapter' || value === 'event' || value === 'place') {
    return value;
  }
  return undefined;
}

function pickLang(value: unknown, fallback: Locale): SearchDoc['lang'] | undefined {
  if (value === 'en' || value === 'ar') {
    return value;
  }
  if (fallback === 'en' || fallback === 'ar') {
    return fallback;
  }
  return undefined;
}

function coerceSummary(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value;
  }
  if (value == null) return undefined;
  try {
    return String(value);
  } catch (err) {
    console.warn('[search] unable to coerce summary field', err);
    return undefined;
  }
}

export function normalizeSearchDocs(raw: unknown, locale?: 'en' | 'ar'): SearchDoc[] {
  if (!Array.isArray(raw)) {
    console.warn('[search] expected an array of documents, received', raw);
    return [];
  }

  const seen = new Set<string>();
  const docs: SearchDoc[] = [];

  raw.forEach((value, index) => {
    if (!value || typeof value !== 'object') {
      console.warn('[search] skipping malformed document at index', index, value);
      return;
    }

    const entry = value as RawDoc;
    const idCandidate = entry.id ?? entry.slug ?? entry.href ?? entry.url;
    const id = idCandidate != null && idCandidate !== '' ? String(idCandidate) : `anon-${index}`;

    if (seen.has(id)) {
      console.warn('[search] duplicate id, skipping', id, entry);
      return;
    }

    const hrefCandidate = entry.href ?? entry.url ?? entry.path;
    const href = hrefCandidate != null && hrefCandidate !== '' ? String(hrefCandidate) : '/';

    const titleCandidate = entry.title ?? entry.name ?? entry.slug ?? id;
    const title = titleCandidate != null && titleCandidate !== '' ? String(titleCandidate) : 'Untitled';

    const summary = coerceSummary(entry.summary ?? entry.excerpt ?? entry.description ?? '');
    const tags = normaliseTags(entry.tags ?? entry.keywords);
    const lang = pickLang(entry.lang, locale);
    const type = pickType(entry.type ?? entry.kind);

    seen.add(id);
    docs.push({
      id,
      title,
      href,
      summary,
      tags,
      lang,
      type,
    });
  });

  return docs;
}
