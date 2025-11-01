'use client';

import { useMemo, useState } from 'react';
import type { SearchDoc } from '@/lib/loaders.search';

export default function Search({
  docs,
  placeholder = 'Search',
  clearLabel = 'Clear search',
  tagPrefix = '/timeline?tags='
}: {
  docs: SearchDoc[];
  placeholder?: string;
  clearLabel?: string;
  tagPrefix?: string;
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return docs;
    return docs.filter(d =>
      d.title.toLowerCase().includes(needle) ||
      d.summary.toLowerCase().includes(needle) ||
      d.tags.some(t => t.toLowerCase().includes(needle))
    );
  }, [q, docs]);

  return (
    <div>
      <label htmlFor="home-search" className="sr-only">{placeholder}</label>
      <div className="relative">
        <input
          id="home-search"
          name="q"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded border px-3 py-2"
          aria-label={placeholder}
        />
        {q ? (
          <button
            type="button"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
            onClick={() => setQ('')}
            aria-label={clearLabel}
          >
            ×
          </button>
        ) : null}
      </div>
      <ul className="mt-4 space-y-3">
        {filtered.map((d, i) => (
          <li key={d.href + i} className="rounded border p-3">
            <a href={d.href} className="font-medium hover:underline">{d.title}</a>
            {d.summary ? <p className="mt-1 text-sm text-gray-600">{d.summary}</p> : null}
            {d.tags?.length ? (
              <div className="mt-2 text-xs text-gray-500">
                {d.tags.map((t, idx) => (
                  <a key={t + idx} href={`${tagPrefix}${encodeURIComponent(t)}`} className="mr-2 hover:underline">#{t}</a>
                ))}
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
