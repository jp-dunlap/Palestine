'use client';

import React, {
  Fragment,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import LocaleLink from '@/components/LocaleLink';
import { formatNumber } from '@/lib/format';
import {
  composeSearchFilterAnnouncement,
  composeSearchQueryAnnouncement,
} from '@/lib/a11y-announcements';
import { buildSearchIndex, searchIndex, type QueryOptions, type SearchIndex } from '@/lib/search';
import { normalizeSearchDocs } from '@/lib/search-normalize';
import type { SearchDoc } from '@/lib/search.types';
import A11yAnnouncer, { type A11yAnnouncerHandle } from '@/components/A11yAnnouncer';

type Props = {
  locale?: 'en' | 'ar';
};

type TypeFilter = 'chapter' | 'event' | 'place';

const DEFAULT_LIMIT = 8;

export default function SearchClient({ locale = 'en' }: Props) {
  const isArabic = locale === 'ar';
  const [docs, setDocs] = useState<SearchDoc[]>([]);
  const [index, setIndex] = useState<SearchIndex | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [query, setQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<Set<TypeFilter>>(new Set());
  const searchInputId = useId();

  const t = useMemo(() => {
    if (isArabic) {
      return {
        label: 'ابحث',
        placeholder: 'ابحث في الفصول والأماكن والخط الزمني…',
        loading: 'جاري تحميل الفهرس…',
        error: 'تعذّر تحميل الفهرس. حاول مجددًا.',
        empty: 'لا توجد نتائج مطابقة.',
        count: (n: number) =>
          n === 1 ? 'نتيجة واحدة' : `${formatNumber(n, 'ar')} من النتائج`,
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
        typeFilterLegend: 'تصفية حسب النوع',
        typeFilterAll: 'كل الأنواع',
        typeFilterAria: (label: string) => `تصفية النتائج حسب ${label}`,
        filterStateSelected: 'محدد',
        filterStateNotSelected: 'غير محدد',
        queryAnnouncement: (value: string) => `بحث عن «${value}»`,
        queryClearedAnnouncement: 'تم مسح البحث',
        filterAnnouncementSingular: 'مرشح',
        filterAnnouncementPlural: 'مرشحات',
      } as const;
    }
    return {
      label: 'Search',
      placeholder: 'Search chapters, places, timeline…',
      loading: 'Loading search index…',
      error: 'Unable to load the search index. Please try again.',
      empty: 'No matching results yet.',
      count: (n: number) => (n === 1 ? '1 result' : `${formatNumber(n, 'en')} results`),
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
      typeFilterLegend: 'Filter by type',
      typeFilterAll: 'All types',
      typeFilterAria: (label: string) => `Filter results to ${label}`,
      filterStateSelected: 'selected',
      filterStateNotSelected: 'not selected',
      queryAnnouncement: (value: string) => `Search for “${value}”`,
      queryClearedAnnouncement: 'Search cleared',
      filterAnnouncementSingular: 'filter',
      filterAnnouncementPlural: 'filters',
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
          setIndex(buildSearchIndex(normalised));
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

  const typeSelections = useMemo(() => Array.from(selectedTypes), [selectedTypes]);

  const searchResults = useMemo(() => {
    if (!docs.length) return [];
    const options: QueryOptions = {
      limit: DEFAULT_LIMIT,
      types: typeSelections.length ? typeSelections : undefined,
    };
    if (index) {
      return searchIndex(index, query, options);
    }
    const filtered = typeSelections.length
      ? docs.filter((doc) => doc.type && typeSelections.includes(doc.type as TypeFilter))
      : docs;
    return filtered.slice(0, DEFAULT_LIMIT).map((doc) => ({ doc, score: 0 }));
  }, [docs, index, query, typeSelections]);

  const results = useMemo(() => searchResults.map((entry) => entry.doc), [searchResults]);

  const activeQuery = useMemo(() => query.trim(), [query]);
  const activeQueryLower = useMemo(() => activeQuery.toLowerCase(), [activeQuery]);

  const announcerRef = useRef<A11yAnnouncerHandle | null>(null);
  const previousQueryRef = useRef(activeQuery);
  const previousTypeKeyRef = useRef('');

  useEffect(() => {
    const currentAnnouncer = announcerRef.current;
    if (!currentAnnouncer) {
      previousQueryRef.current = activeQuery;
      return;
    }
    if (previousQueryRef.current === activeQuery) {
      return;
    }
    previousQueryRef.current = activeQuery;
    const message = composeSearchQueryAnnouncement(activeQuery, {
      describeQuery: t.queryAnnouncement,
      clearedMessage: t.queryClearedAnnouncement,
      resultCountText: t.count(results.length),
    });
    currentAnnouncer.announce(message);
  }, [activeQuery, results.length, t]);

  useEffect(() => {
    const selections = [...typeSelections].sort();
    const key = selections.join('|');
    const currentAnnouncer = announcerRef.current;
    if (!currentAnnouncer) {
      previousTypeKeyRef.current = key;
      return;
    }
    if (previousTypeKeyRef.current === key) {
      return;
    }
    previousTypeKeyRef.current = key;
    const labels = selections.length
      ? selections.map((selection) => t.typeLabels[selection as TypeFilter])
      : [t.typeFilterAll];
    const joiner = isArabic ? '، ' : ', ';
    const message = composeSearchFilterAnnouncement(labels, {
      joiner,
      singularWord: t.filterAnnouncementSingular,
      pluralWord: t.filterAnnouncementPlural,
      resultCountText: t.count(results.length),
      resultSeparator: joiner,
    });
    currentAnnouncer.announce(message);
  }, [typeSelections, results.length, t, isArabic]);

  const statusMessage = useMemo(() => {
    if (status === 'loading') return t.loading;
    if (status === 'error') return `${t.error}${errorMessage ? ` (${errorMessage})` : ''}`;
    if (status === 'ready') return t.count(results.length);
    return '';
  }, [status, t, results.length, errorMessage]);

  function toggleType(type: TypeFilter) {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return new Set(next);
    });
  }

  function clearTypes() {
    setSelectedTypes(new Set());
  }

  function highlight(text: string | undefined) {
    if (!text) return null;
    if (!activeQuery) return text;
    const lower = text.toLowerCase();
    const queryLength = activeQuery.length;
    const nodes: ReactNode[] = [];
    let cursor = 0;
    let matchIndex = lower.indexOf(activeQueryLower, cursor);

    if (matchIndex === -1) {
      return text;
    }

    while (matchIndex !== -1) {
      if (matchIndex > cursor) {
        nodes.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor, matchIndex)}</Fragment>);
      }
      const matched = text.slice(matchIndex, matchIndex + queryLength);
      nodes.push(
        <mark key={`match-${matchIndex}`} className="rounded bg-yellow-200 px-0.5 text-gray-900">
          {matched}
        </mark>
      );
      cursor = matchIndex + queryLength;
      matchIndex = lower.indexOf(activeQueryLower, cursor);
    }

    if (cursor < text.length) {
      nodes.push(<Fragment key={`text-${cursor}`}>{text.slice(cursor)}</Fragment>);
    }

    return nodes;
  }

  return (
    <div dir={isArabic ? 'rtl' : 'ltr'}>
      <A11yAnnouncer ref={announcerRef} />
      <label className="mb-1 block text-sm font-medium" htmlFor={searchInputId}>
        {t.label}
      </label>
      <input
        id={searchInputId}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder={t.placeholder}
        dir={isArabic ? 'rtl' : 'ltr'}
      />

      <fieldset className={`mt-3 border-0 p-0 text-sm ${isArabic ? 'text-right' : ''}`}>
        <legend className="mb-2 text-xs font-semibold text-gray-700">{t.typeFilterLegend}</legend>
        <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`}>
          <button
            type="button"
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
              selectedTypes.size === 0
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
            onClick={clearTypes}
            aria-pressed={selectedTypes.size === 0}
          >
            {t.typeFilterAll}
          </button>
          {(Object.keys(t.typeLabels) as TypeFilter[]).map((type) => {
            const selected = selectedTypes.has(type);
            return (
              <button
                key={type}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  selected
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-300 text-gray-900 hover:bg-gray-100'
                }`}
                onClick={() => toggleType(type)}
                aria-pressed={selected}
                aria-label={`${t.typeFilterAria(t.typeLabels[type])} — ${selected ? t.filterStateSelected : t.filterStateNotSelected}`}
              >
                {t.typeLabels[type]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="sr-only">
        {statusMessage}
      </div>

      <ul className="mt-4 space-y-3" dir={isArabic ? 'rtl' : 'ltr'}>
        {status === 'error' ? (
          <li className="rounded border p-3 text-sm text-red-600">{t.error}</li>
        ) : null}
        {status !== 'error' && results.length === 0 && status === 'ready' ? (
          <li className="rounded border p-3 text-sm text-gray-700">{t.empty}</li>
        ) : null}
        {results.map((doc) => {
          const typeLabel = doc.type ? t.typeLabels[doc.type as TypeFilter] : null;
          const typeIcon = doc.type ? t.typeIcons[doc.type as TypeFilter] : null;
          return (
            <li
              key={doc.id}
              className="rounded border p-3 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-gray-900 focus-within:ring-offset-2 focus-within:ring-offset-white"
            >
              <LocaleLink
                href={doc.href}
                locale={locale}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{highlight(doc.title)}</div>
                  {typeLabel ? (
                    <span
                      className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800"
                      aria-label={typeLabel}
                    >
                      {typeIcon ? <span aria-hidden="true">{typeIcon}</span> : null}
                      <span>{typeLabel}</span>
                    </span>
                  ) : null}
                </div>
                {doc.summary ? (
                  <p className="mt-1 text-sm text-gray-700">{highlight(doc.summary)}</p>
                ) : null}
                {doc.tags?.length ? (
                  <p className="mt-2 text-xs text-gray-700">#{doc.tags.join(' #')}</p>
                ) : null}
              </LocaleLink>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
