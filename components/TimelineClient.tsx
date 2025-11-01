'use client';

import { useMemo, useState } from 'react';
import type { Era, TimelineEvent } from '@/lib/timeline.api';

export default function TimelineClient({
  events,
  eras,
  locale
}: {
  events: TimelineEvent[];
  eras: Era[];
  locale: 'en' | 'ar';
}) {
  const isAr = locale === 'ar';
  const [q, setQ] = useState('');
  const [checked, setChecked] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const t = {
    search: isAr ? 'ابحث' : 'Search',
    clear: isAr ? 'مسح المرشحات' : 'Clear filters',
    eras: isAr ? 'العصور' : 'Eras'
  };

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return events.filter(ev => {
      if (checked.length) {
        if (!ev.era || !checked.includes(String(ev.era))) return false;
      }
      if (tags.length) {
        const evTags = isAr ? (ev.tags_ar ?? ev.tags ?? []) : (ev.tags ?? []);
        const lt = (evTags ?? []).map(tg => String(tg).toLowerCase());
        const ok = tags.every(tg => lt.includes(tg.toLowerCase()));
        if (!ok) return false;
      }
      if (!needle) return true;
      const title = isAr ? (ev.title_ar ?? ev.title ?? '') : (ev.title ?? '');
      const summary = isAr ? (ev.summary_ar ?? ev.summary ?? '') : (ev.summary ?? '');
      const hay = [title, summary, ...(ev.tags ?? [])].join(' ').toLowerCase();
      return hay.includes(needle);
    });
  }, [events, checked, q, tags, isAr]);

  const toggleEra = (id: string) => {
    setChecked(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const onTagClick = (tg: string) => {
    setTags(prev => (prev.includes(tg) ? prev.filter(x => x !== tg) : [...prev, tg]));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <label htmlFor="timeline-search" className="sr-only">{t.search}</label>
        <input
          id="timeline-search"
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder={t.search}
          className="w-full max-w-md rounded border px-3 py-2"
          aria-label={t.search}
        />
        <button
          type="button"
          className="rounded border px-3 py-2 text-sm"
          onClick={() => { setQ(''); setChecked([]); setTags([]); }}
          aria-label={t.clear}
        >
          {t.clear}
        </button>
      </div>

      <fieldset className="flex flex-wrap items-center gap-3">
        <legend className="text-sm font-semibold">{t.eras}</legend>
        {eras.map(e => (
          <label key={e.id} className="inline-flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={checked.includes(e.id)}
              onChange={() => toggleEra(e.id)}
            />
            <span>{isAr ? (e.title_ar ?? e.title) : e.title}</span>
          </label>
        ))}
      </fieldset>

      <ul className="divide-y rounded border">
        {filtered.map(ev => {
          const title = isAr ? (ev.title_ar ?? ev.title ?? '') : (ev.title ?? '');
          const summary = isAr ? (ev.summary_ar ?? ev.summary ?? '') : (ev.summary ?? '');
          const era = ev.era ?? '';
          const href = isAr ? `/ar/timeline#${ev.id}` : `/timeline#${ev.id}`;
          const tg = isAr ? (ev.tags_ar ?? ev.tags ?? []) : (ev.tags ?? []);
          const pl = ev.places ?? [];
          return (
            <li key={ev.id} className="p-3">
              <a href={href} className="font-medium hover:underline">{title}</a>
              {summary ? <p className="mt-1 text-sm text-gray-600">{summary}</p> : null}
              <div className="mt-2 text-xs text-gray-500">
                <span className="mr-3">{era}</span>
                {tg.map((t, i) => (
                  <button
                    key={String(t) + i}
                    type="button"
                    className="mr-2 underline"
                    onClick={() => onTagClick(String(t))}
                  >
                    #{t}
                  </button>
                ))}
                {pl.map((p, i) => (
                  <a key={String(p) + i} className="mr-2 hover:underline" href={(isAr ? '/ar/timeline' : '/timeline') + `?q=${encodeURIComponent(String(p))}`}>
                    {p}
                  </a>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
