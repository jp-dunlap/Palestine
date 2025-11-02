'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import MiniSearch from 'minisearch';
import { normalizeSearchDocs } from '@/lib/search-normalize';
import type { SearchDoc } from '@/lib/search.types';

type Props = {
  locale?: 'en' | 'ar';
};

const DEFAULT_LIMIT = 8;

export default function SearchClient({ locale = 'en' }: Props) {
  const isArabic = locale === 'ar';
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = useMemo(() => {
    if (isArabic) {
      return {
        label: 'ابحث',
        placeholder: 'ابحث في الفصول والأماكن والخط الزمني…',
        loading: 'جاري تحميل الفهرس…',
        error: 'تعذّر تحميل الفهرس. حاول مجددًا.',
        empty: 'لا توجد نتائج مطابقة.',
        count: (n: number) => (n === 1 ? 'نتيجة واحدة' : `${n} من النتائج`),
        typeLabels: {
          chapter: 'فصل',
          event: 'حدث',
          place: 'مكان',
        } as const,
        typeIcons: {
          chapter: '📖',
          event: '🗓️',
          place: '📍',
        } as const,
      } as const;
    }
    return {
      label: 'Search',
      placeholder: 'Search chapters, places, timeline…',
      loading: 'Loading search index…',
      error: 'Unable to load the search index. Please try again.',
      empty: 'No matching results yet.',
      count: (n: number) => (n === 1 ? '1 result' : `${n} results`),
      typeLabels: {
        chapter: 'Chapter',
        event: 'Timeline event',
        place: 'Place',
      } as const,
      typeIcons: {
        chapter: '📖',
        event: '🗓️',
        place: '📍',
      } as const,
    } as const;
  }, [isArabic]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const res = await fetch(`/search.${locale}.json`, {
          cache: 'force-cache',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        if (!cancelled) {
          const normalised = normalizeSearchDocs(data, locale);
          setDocs(normalised);
          setStatus('ready');
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'error');
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const index = useMemo(() => {
    if (docs.length === 0) return null;
    const mini = new MiniSearch<SearchDoc>({
      idField: 'id',
      fields: ['title', 'summary', 'tags'],
      storeFields: ['id', 'title', 'summary', 'tags', 'href', 'type', 'lang'],
      searchOptions: {
        combineWith: 'AND',
        prefix: true,
      },
    });

    try {
      mini.addAll(docs);
    } catch (err) {
      console.error('[search] indexing failed:', err);
      return null;
    }

    return mini;
  }, [docs]);

  const results = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return docs.slice(0, DEFAULT_LIMIT);
    }
    if (!index) return [];
    const seen = new Set<string>();
    const hits = index.search(trimmed);
    const mapped: SearchDoc[] = [];
    for (const hit of hits) {
      const href = typeof hit.href === 'string' ? hit.href : '';
      if (!href || seen.has(href)) continue;
      seen.add(href);

      mapped.push({
        id: typeof hit.id === 'string' ? hit.id : href,
        title: typeof hit.title === 'string' ? hit.title : '',
        summary: typeof hit.summary === 'string' ? hit.summary : undefined,
        tags: Array.isArray(hit.tags) ? hit.tags.map(String) : [],
        href,
        type:
          hit.type === 'chapter' || hit.type === 'event' || hit.type === 'place'
            ? hit.type
            : undefined,
        lang: hit.lang === 'ar' || hit.lang === 'en' ? hit.lang : locale,
      });
      if (mapped.length >= DEFAULT_LIMIT) break;
    }
    return mapped;
  }, [docs, index, locale, query]);

  const statusMessage = useMemo(() => {
    if (status === 'loading') return t.loading;
    if (status === 'error') return `${t.error}${errorMessage ? ` (${errorMessage})` : ''}`;
    if (status === 'ready') return t.count(results.length);
    return '';
  }, [status, t, results.length, errorMessage]);

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'}>
      <label className="mb-1 block text-sm font-medium">{t.label}</label>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder={t.placeholder}
        dir={isArabic ? 'rtl' : 'ltr'}
        aria-label={t.label}
      />
      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      <ul className="mt-4 space-y-3" dir={isArabic ? 'rtl' : 'ltr'}>
        {status === 'error' ? (
          <li className="rounded border p-3 text-sm text-red-600">{t.error}</li>
        ) : null}
        {status !== 'error' && results.length === 0 && status !== 'loading' ? (
          <li className="rounded border p-3 text-sm text-gray-600">{t.empty}</li>
        ) : null}
        {results.map((doc) => {
          const typeLabel = doc.type ? t.typeLabels[doc.type] : null;
          const typeIcon = doc.type ? t.typeIcons[doc.type] : null;
          return (
            <li
              key={doc.id}
              className="rounded border p-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-900 focus-within:ring-offset-2 focus-within:ring-offset-white"
            >
              <Link
                href={doc.href}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{doc.title}</div>
                  {typeLabel ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"
                      aria-label={typeLabel}
                    >
                      {typeIcon ? <span aria-hidden="true">{typeIcon}</span> : null}
                      <span>{typeLabel}</span>
                    </span>
                  ) : null}
                </div>
              {doc.summary ? (
                <div className="mt-1 text-sm text-gray-600">{doc.summary}</div>
              ) : null}
              {doc.tags && doc.tags.length ? (
                <div className="mt-1 text-xs text-gray-500">#{doc.tags.join(' #')}</div>
              ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
