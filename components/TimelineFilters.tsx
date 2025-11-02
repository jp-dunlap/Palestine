'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Era } from '@/lib/types';
import * as React from 'react';

function formatResultMessage(count: number, isArabic: boolean): string {
  if (isArabic) {
    return count === 1 ? 'تم العثور على حدث واحد' : `تم العثور على ${count} من الأحداث`;
  }
  return count === 1 ? 'Showing 1 event' : `Showing ${count} events`;
}

export default function TimelineFilters({
  eras,
  locale = 'en',
  resultCount,
}: {
  eras: Era[];
  locale?: 'en' | 'ar';
  resultCount: number;
}) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const selectedEras = new Set((sp.get('eras') ?? '').split(',').filter(Boolean));
  const isArabic = locale === 'ar';
  const [announcement, setAnnouncement] = React.useState(() =>
    formatResultMessage(resultCount, isArabic)
  );

  const t = React.useMemo(() => {
    if (isArabic) {
      return {
        placeholder: 'ابحث في الخط الزمني…',
        label: 'ابحث',
      } as const;
    }
    return {
      placeholder: 'Search timeline…',
      label: 'Search',
    } as const;
  }, [isArabic]);

  React.useEffect(() => {
    setAnnouncement(formatResultMessage(resultCount, isArabic));
  }, [resultCount, isArabic]);

  function update(param: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleEra(id: string) {
    const next = new Set(selectedEras);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update('eras', Array.from(next).join(','));
  }

  return (
    <div className="mb-6 space-y-3" dir={isArabic ? 'rtl' : 'ltr'} role="search">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          update('q', e.target.value);
        }}
        placeholder={t.placeholder}
        aria-label={t.label}
        className={`w-full rounded border px-3 py-2 text-sm ${isArabic ? 'text-right' : ''}`}
      />

      <div className={`flex flex-wrap gap-3 ${isArabic ? 'justify-end' : ''}`}>
        {eras.map((e) => (
          <label
            key={e.id}
            className={`flex items-center gap-2 text-sm ${isArabic ? 'flex-row-reverse' : ''}`}
          >
            <input
              type="checkbox"
              checked={selectedEras.has(e.id)}
              onChange={() => toggleEra(e.id)}
            />
            <span>{isArabic ? e.title_ar ?? e.title : e.title}</span>
          </label>
        ))}
      </div>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
