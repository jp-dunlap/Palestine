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
        legend: 'تصفية حسب الحقبة',
        filterAria: (era: string) => `تصفية حسب الحقبة ${era}`,
      } as const;
    }
    return {
      placeholder: 'Search timeline…',
      label: 'Search',
      legend: 'Filter by era',
      filterAria: (era: string) => `Filter by era ${era}`,
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

  const chipBaseClasses =
    'inline-flex cursor-pointer select-none rounded-full px-3 py-1 text-sm font-medium transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-white dark:peer-focus-visible:ring-offset-gray-900';

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

      <fieldset className={`m-0 border-0 p-0 ${isArabic ? 'text-right' : ''}`}>
        <legend className={`mb-2 text-sm font-medium text-gray-700 ${isArabic ? 'text-right' : ''}`}>
          {t.legend}
        </legend>
        <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`}>
          {eras.map((e) => {
            const id = `timeline-filter-${e.id}`;
            const label = isArabic ? e.title_ar ?? e.title : e.title;
            const selected = selectedEras.has(e.id);
            const stateClasses = selected
              ? 'bg-primary-600 text-white'
              : 'bg-gray-300 text-gray-900 hover:bg-gray-400 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600';
            return (
              <div key={e.id} className="flex">
                <input
                  type="checkbox"
                  id={id}
                  checked={selected}
                  onChange={() => toggleEra(e.id)}
                  className="peer sr-only"
                  aria-label={t.filterAria(label)}
                />
                <label
                  htmlFor={id}
                  className={`${chipBaseClasses} ${stateClasses}`}
                  aria-pressed={selected}
                  aria-controls="timeline-results"
                  aria-label={t.filterAria(label)}
                >
                  {label}
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}
