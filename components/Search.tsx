// components/Search.tsx
'use client';

import { useMemo, useState } from 'react';

export type SearchDoc = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang?: 'en' | 'ar';
};

type Props = {
  /** Docs provided by the server page (already in preferred order) */
  docs: SearchDoc[];
  /** 'en' (default) or 'ar' to localize placeholder + UI strings */
  locale?: 'en' | 'ar';
};

export default function Search({ docs, locale = 'en' }: Props) {
  const [q, setQ] = useState('');

  const t = useMemo(() => {
    if (locale === 'ar') {
      return {
        searchLabel: 'ابحث',
        placeholder: 'ابحث في الفصول، الأماكن، والخط الزمني…',
      };
    }
    return {
      searchLabel: 'Search',
      placeholder: 'Search chapters, places, timeline…',
    };
  }, [locale]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return docs;
    return docs.filter((d) => {
      const hay = [d.title, d.summary, ...(d.tags ?? [])].join(' ').toLowerCase();
      return hay.includes(qq);
    });
  }, [q, docs]);

  // Limit initial render for snappy paint
  const initial = filtered.slice(0, 8);

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{t.searchLabel}</label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="w-full rounded border px-3 py-2 text-sm"
        placeholder={t.placeholder}
        dir={locale === 'ar' ? 'rtl' : 'ltr'}
      />

      <ul className="mt-4 space-y-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        {initial.map((d, i) => (
          <li key={`${d.href}-${i}`} className="rounded border p-3 hover:bg-gray-50">
            <a href={d.href} className="block">
              <div className="font-semibold">{d.title}</div>
              {d.summary ? (
                <div className="text-sm text-gray-600 mt-1">{d.summary}</div>
              ) : null}
              {(d.tags?.length ?? 0) > 0 ? (
                <div className="mt-1 text-xs text-gray-500">
                  #{d.tags!.join(' #')}
                </div>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
