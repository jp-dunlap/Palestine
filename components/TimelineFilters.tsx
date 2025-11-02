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
  const selectedEras = React.useMemo(() => {
    const raw = sp.getAll('eras');
    const values = raw
      .flatMap(value => value.split(','))
      .map(value => value.trim())
      .filter(Boolean);
    if (values.length) {
      return new Set(values);
    }
    return new Set((sp.get('eras') ?? '').split(',').filter(Boolean));
  }, [sp]);
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
    'inline-flex cursor-pointer select-none rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  return (
    <form
      role="search"
      method="get"
      action={pathname}
      className="mb-6 space-y-3"
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <input
        name="q"
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
        <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`} role="group" aria-label={t.legend}>
          {eras.map((e) => {
            const label = isArabic ? e.title_ar ?? e.title : e.title;
            const selected = selectedEras.has(e.id);
            const stateClasses = selected
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300 text-gray-900 hover:bg-gray-100';
            return (
              <button
                type="button"
                key={e.id}
                className={`${chipBaseClasses} ${stateClasses}`}
                aria-pressed={selected}
                aria-controls="timeline-results"
                aria-label={t.filterAria(label)}
                onClick={() => toggleEra(e.id)}
                data-selected={selected ? 'true' : 'false'}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <input type="hidden" name="eras" value={Array.from(selectedEras).join(',')} />

      <button
        type="submit"
        className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
      >
        {isArabic ? 'تطبيق' : 'Apply'}
      </button>

      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </form>
  );
}
