'use client';

import { useMemo, useState } from 'react';

export type Era = { id: string; title: string; title_ar?: string };
export type TimelineEvent = {
  id: string;
  title: string;
  summary?: string;
  tags?: string[];
  era?: string;
  href: string;
};

export default function TimelinePageClient({
  events,
  eras,
  locale = 'en',
}: {
  events: TimelineEvent[];
  eras: Era[];
  locale?: 'en' | 'ar';
}) {
  const [active, setActive] = useState<string[]>([]);

  const toggle = (id: string) => {
    setActive((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]));
  };

  const filtered = useMemo(() => {
    if (active.length === 0) return events;
    return events.filter((e) => e.era && active.includes(e.era));
  }, [active, events]);

  return (
    <div className={locale === 'ar' ? 'font-arabic' : undefined}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {eras.map((e) => {
          const label = locale === 'ar' ? e.title_ar ?? e.title : e.title;
          const checked = active.includes(e.id);
          return (
            <label key={e.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(e.id)}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-gray-600">
          {locale === 'ar' ? 'لا توجد أحداث في هذا العصر.' : 'No events found in this era.'}
        </p>
      ) : null}

      <ul className="mt-4 space-y-4">
        {filtered.map((ev) => (
          <li key={ev.id} className="rounded border p-3">
            <a href={ev.href} className="block">
              <h3 className="text-sm font-semibold">{ev.title}</h3>
              {ev.summary ? <p className="mt-1 text-xs text-gray-600">{ev.summary}</p> : null}
              {ev.tags?.length ? (
                <div className="mt-1 text-xs text-gray-500">#{ev.tags.join(' #')}</div>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
