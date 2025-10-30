'use client';

import { useMemo, useState } from 'react';
import MiniSearch from 'minisearch';
import type { SearchDoc } from '@/lib/loaders.search';

export type SearchProps = {
  docs: SearchDoc[];
  placeholder?: string;
};

function pathFor(doc: SearchDoc): string {
  if (doc.kind === 'chapter' && doc.slug) return `/chapters/${doc.slug}`;
  if (doc.kind === 'timeline') return `/timeline`;
  return `/maps`;
}

export default function Search({ docs, placeholder }: SearchProps) {
  const [q, setQ] = useState('');

  const index = useMemo(() => {
    const ms = new MiniSearch<SearchDoc>({
      fields: ['title', 'summary', 'tags'],          // indexed fields
      storeFields: ['id', 'kind', 'title', 'slug', 'summary', 'tags'] // returned in results
    });
    ms.addAll(docs);
    return ms;
  }, [docs]);

  const results = useMemo(
    () => (q.trim() ? index.search(q, { boost: { title: 2 }, prefix: true, fuzzy: 0.2 }) : []),
    [index, q]
  );

  return (
    <div className="w-full max-w-xl">
      <input
        aria-label="Search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder ?? 'Search chapters & timeline…'}
        className="w-full border rounded p-2"
      />

      {results.length > 0 && (
        <ul className="mt-3 divide-y rounded border">
          {results.slice(0, 8).map((r: any) => (
            <li key={r.id} className="p-2 hover:bg-gray-50">
              <a href={pathFor(r)} className="block">
                <div className="text-sm font-medium">{r.title}</div>
                {r.summary && <div className="text-xs text-gray-600">{r.summary}</div>}
                <div className="text-[11px] text-gray-500">
                  {r.kind}{r.kind === 'chapter' && r.slug ? ` · ${r.slug}` : ''}
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
