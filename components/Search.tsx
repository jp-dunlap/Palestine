'use client';

import { useMemo, useState } from 'react';

type Doc = { title: string; summary: string; tags: string[]; href: string; lang: 'en' | 'ar' };
type Props = {
  docs: Doc[];
  placeholder?: string;
  locale?: 'en' | 'ar';
};

export default function Search({ docs, placeholder, locale = 'en' }: Props) {
  const [q, setQ] = useState('');
  const [visible, setVisible] = useState(8);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter((d) => {
      const hay =
        `${d.title} ${d.summary} ${d.tags.join(' ')}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [q, docs]);

  const shown = results.slice(0, visible);

  return (
    <div>
      <label className="block text-sm text-gray-700">
        <span className={locale === 'ar' ? 'font-arabic' : undefined}>
          {placeholder ?? (locale === 'ar' ? 'ابحث…' : 'Search…')}
        </span>
        <input
          className="mt-1 w-full rounded border px-3 py-2 text-sm"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setVisible(8);
          }}
          placeholder={placeholder ?? (locale === 'ar' ? 'ابحث…' : 'Search…')}
        />
      </label>

      <div className="mt-3 text-xs text-gray-600" aria-live="polite">
        {results.length === 0
          ? locale === 'ar'
            ? 'لا توجد نتائج مطابقة'
            : 'No items match your search'
          : locale === 'ar'
          ? `${results.length} نتيجة`
          : `${results.length} result${results.length === 1 ? '' : 's'}`}
      </div>

      <ul className="mt-4 space-y-3">
        {shown.map((d, i) => (
          <li key={`${d.href}-${i}`} className="rounded border p-3">
            <a href={d.href} className="block">
              <h3 className="text-sm font-semibold">
                {d.title}
              </h3>
              {d.summary ? (
                <p className="mt-1 text-xs text-gray-600">{d.summary}</p>
              ) : null}
              {d.tags?.length ? (
                <div className="mt-1 text-xs text-gray-500">#{d.tags.join(' #')}</div>
              ) : null}
            </a>
          </li>
        ))}
      </ul>

      {results.length > visible ? (
        <div className="mt-4">
          <button
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
            onClick={() => setVisible((v) => v + 8)}
          >
            {locale === 'ar' ? 'عرض المزيد' : 'Load more results'}
          </button>
        </div>
      ) : null}
    </div>
  );
}
