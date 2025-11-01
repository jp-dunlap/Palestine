'use client';

import { useMemo, useState, useEffect, useRef } from 'react';

export type SearchDoc = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang: 'en' | 'ar';
};

type Props = {
  docs: SearchDoc[];
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  lang?: 'en' | 'ar';
};

export default function Search({ docs, placeholder = 'Search…', dir = 'ltr', lang = 'en' }: Props) {
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(8);
  const liveRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter(d => {
      const hay = [d.title, d.summary, ...(d.tags || [])].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [docs, q]);

  const visible = filtered.slice(0, limit);
  const hasMore = filtered.length > visible.length;

  useEffect(() => {
    // Reduce limit when query changes so the user sees the “top” results first
    setLimit(8);
  }, [q]);

  useEffect(() => {
    // Announce results count for screen readers when it changes
    if (liveRef.current) {
      liveRef.current.textContent =
        filtered.length === 0
          ? (lang === 'ar' ? 'لا نتائج' : 'No results')
          : (lang === 'ar'
              ? `عُثر على ${filtered.length} نتيجة`
              : `${filtered.length} result${filtered.length === 1 ? '' : 's'} found`);
    }
  }, [filtered.length, lang]);

  return (
    <div dir={dir}>
      <label className="block text-sm font-medium mb-2" htmlFor="q">
        {lang === 'ar' ? 'بحث' : 'Search'}
      </label>
      <input
        id="q"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded border px-3 py-2"
        aria-describedby="search-status"
        aria-label={lang === 'ar' ? 'بحث' : 'Search'}
      />

      <div id="search-status" ref={liveRef} className="sr-only" aria-live="polite" />

      {visible.length === 0 ? (
        <p className="mt-4 text-sm text-gray-600">
          {lang === 'ar' ? 'لا توجد نتائج مطابقة.' : 'No results found.'}
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {visible.map((d) => (
            <li key={`${d.lang}:${d.href}`} className="rounded border p-3 hover:bg-gray-50">
              <a href={d.href} className="block">
                <h3 className="font-semibold">{d.title}</h3>
                {d.summary ? <p className="text-sm text-gray-600 mt-1">{d.summary}</p> : null}
                {d.tags?.length ? (
                  <p className="mt-2 text-xs text-gray-500">#{d.tags.join(' #')}</p>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasMore && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setLimit((n) => n + 12)}
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label={lang === 'ar' ? 'عرض المزيد من النتائج' : 'Show more results'}
          >
            {lang === 'ar' ? 'عرض المزيد' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  );
}
