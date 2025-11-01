import type { TimelineEvent, Era } from '@/lib/types';

function yearOf(d: string | number | undefined): string {
  if (d === undefined || d === null) return '';
  const s = String(d);
  const m = s.match(/^(-?\d{1,4})/);
  return m ? m[1] : s;
}

export default function Timeline({
  events,
  eras,
  locale = 'en',
}: {
  events: TimelineEvent[];
  eras: Era[];
  locale?: 'en' | 'ar';
}) {
  const isArabic = locale === 'ar';
  const eraById = new Map(
    eras.map((e) => [e.id, isArabic ? e.title_ar ?? e.title : e.title])
  );
  return (
    <div className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      {events.map((e) => (
        <div
          key={e.id}
          className={
            isArabic
              ? 'border-r pr-4 text-right'
              : 'border-l pl-4'
          }
        >
          <div className="text-xs text-gray-500">
            {e.era ? eraById.get(e.era) : '—'} · {yearOf(e.start)}
            {e.end ? `–${yearOf(e.end)}` : ''}
          </div>
          <h3 className="text-base font-semibold mt-1">{e.title}</h3>
          {e.summary && <p className="mt-1 text-sm">{e.summary}</p>}
          {(e.tags?.length || e.places?.length) && (
            <p className="mt-1 text-xs text-gray-500">
              {e.tags?.length ? `#${e.tags.join(' #')}` : ''}{' '}
              {e.places?.length ? `· ${e.places.join(', ')}` : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
