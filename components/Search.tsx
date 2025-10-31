'use client';

import { useMemo, useState } from 'react';

type Doc = {
  title: string;
  summary?: string;
  tags?: string[];
  href: string;
};

function normalize(s: string) {
  return s.toLowerCase();
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, query: string): JSX.Element {
  if (!query) return <>{text}</>;
  const q = query.trim();
  if (!q) return <>{text}</>;
  const re = new RegExp(`(${escapeRegExp(q)})`, 'ig');
  const parts = text.split(re);
  return (
    <>
      {parts.map((part, i) =>
        re.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>
      )}
    </>
  );
}

// Simple ranking: title prefix > title contains > summary/tags contains
function scoreDoc(doc: Doc, nq: string) {
  const t = normalize(doc.title);
  let score = 0;
  if (t.startsWith(nq)) score -= 3;
  if (t.includes(nq)) score -= 2;

  const s = doc.summary ? normalize(doc.summary) : '';
  const tg = doc.tags?.join(' ').toLowerCase() ?? '';
  if (s.includes(nq) || tg.includes(nq)) score -= 1;

  return score;
}

export default function Search({ docs }: { docs: Doc[] }) {
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    const nq = normalize(q.trim());
    if (!nq) return [];
    const filtered = docs.filter((d) => {
      const t = normalize(d.title);
      const s = d.summary ? normalize(d.summary) : '';
      const tg = d.tags?.join(' ').toLowerCase() ?? '';
      return t.includes(nq) || s.includes(nq) || tg.includes(nq);
    });
    return filtered
      .map((d) => ({ d, s: scoreDoc(d, nq) }))
      .sort((a, b) => a.s - b.s || a.d.title.localeCompare(b.d.title))
      .map((x) => x.d)
      .slice(0, 12);
  }, [docs, q]);

  const initial = useMemo(() => docs.slice(0, 8), [docs]);

  const list = q.trim() ? results : initial;

  return (
    <div role="search" aria-label="Site search">
      <label className="sr-only" htmlFor="site-search">
        Search
      </label>
      <input
        id="site-search"
        className="w-full rounded border px-3 py-2"
        placeholder="Search chapters, places, timeline…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        inputMode="search"
        autoComplete="off"
      />

      <ul className="mt-3 space-y-2">
        {list.map((d) => (
          <li key={d.href} className="rounded border p-3 hover:bg-gray-50">
            <a href={d.href} className="font-medium underline hover:no-underline">
              {highlight(d.title, q)}
            </a>
            {d.summary ? (
              <div className="text-sm text-gray-600 mt-1">{highlight(d.summary, q)}</div>
            ) : null}
            {d.tags?.length ? (
              <div className="mt-1 text-xs text-gray-500">
                {d.tags.map((tag) => (
                  <span key={tag} className="mr-2">
                    #{tag}
                  </span>
                ))}
              </div>
            ) : null}
          </li>
        ))}

        {q.trim() && results.length === 0 ? (
          <li className="rounded border p-3 text-sm text-gray-600">No results.</li>
        ) : null}
      </ul>
    </div>
  );
}
