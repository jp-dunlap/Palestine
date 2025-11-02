'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Era } from '@/lib/types';
import * as React from 'react';

type Bookmark = {
  id: string;
  label: string;
  url: string;
  eras: string[];
  logic: 'and' | 'or';
  query: string;
};

const BOOKMARK_STORAGE_KEY = 'palestine.timelineBookmarks.v1';

type Locale = 'en' | 'ar';

type Translation = {
  placeholder: string;
  label: string;
  legend: string;
  filterAria: (era: string) => string;
  logicGroupLabel: string;
  logicOr: string;
  logicAnd: string;
  applyLogicOr: string;
  applyLogicAnd: string;
  clear: string;
  save: string;
  bookmarksHeading: string;
  emptyBookmarks: string;
  applyBookmark: string;
  copyBookmark: string;
  deleteBookmark: string;
  prompt: string;
  defaultBookmarkName: string;
  savedBookmark: (label: string) => string;
  copiedBookmark: (label: string) => string;
  copyError: string;
  appliedBookmark: (label: string) => string;
  deletedBookmark: (label: string) => string;
  resultMessage: (count: number) => string;
  resultMessageArabic: (count: number) => string;
};

const translations: Record<Locale, Translation> = {
  en: {
    placeholder: 'Search timeline…',
    label: 'Search',
    legend: 'Filter by era',
    filterAria: (era) => `Filter by era ${era}`,
    logicGroupLabel: 'Filter logic',
    logicOr: 'Match any era (OR)',
    logicAnd: 'Match all eras (AND)',
    applyLogicOr: 'Use OR logic for filters',
    applyLogicAnd: 'Use AND logic for filters',
    clear: 'Clear filters',
    save: 'Save filters',
    bookmarksHeading: 'Saved filter sets',
    emptyBookmarks: 'No saved filters yet.',
    applyBookmark: 'Apply',
    copyBookmark: 'Copy link',
    deleteBookmark: 'Delete',
    prompt: 'Name this filter set',
    defaultBookmarkName: 'Timeline view',
    savedBookmark: (label) => `Saved filter set “${label}”`,
    copiedBookmark: (label) => `Copied link for “${label}”`,
    copyError: 'Unable to copy link. Copy it manually from the address bar.',
    appliedBookmark: (label) => `Applied filter set “${label}”`,
    deletedBookmark: (label) => `Deleted filter set “${label}”`,
    resultMessage: (count) => (count === 1 ? 'Showing 1 event' : `Showing ${count} events`),
    resultMessageArabic: (count) => (count === 1 ? 'تم العثور على حدث واحد' : `تم العثور على ${count} من الأحداث`),
  },
  ar: {
    placeholder: 'ابحث في الخط الزمني…',
    label: 'ابحث',
    legend: 'تصفية حسب الحقبة',
    filterAria: (era) => `تصفية حسب الحقبة ${era}`,
    logicGroupLabel: 'منطق التصفية',
    logicOr: 'مطابقة أي حقبة (أو)',
    logicAnd: 'مطابقة جميع الحقب (و)',
    applyLogicOr: 'استخدم منطق (أو) للتصفية',
    applyLogicAnd: 'استخدم منطق (و) للتصفية',
    clear: 'مسح المرشحات',
    save: 'حفظ المرشحات',
    bookmarksHeading: 'مجموعات المرشحات المحفوظة',
    emptyBookmarks: 'لا توجد مرشحات محفوظة بعد.',
    applyBookmark: 'تطبيق',
    copyBookmark: 'نسخ الرابط',
    deleteBookmark: 'حذف',
    prompt: 'اسم مجموعة المرشحات',
    defaultBookmarkName: 'عرض الخط الزمني',
    savedBookmark: (label) => `تم حفظ مجموعة المرشحات «${label}»`,
    copiedBookmark: (label) => `تم نسخ رابط «${label}»`,
    copyError: 'تعذّر نسخ الرابط. انسخه يدويًا من شريط العنوان.',
    appliedBookmark: (label) => `تم تطبيق مجموعة المرشحات «${label}»`,
    deletedBookmark: (label) => `تم حذف مجموعة المرشحات «${label}»`,
    resultMessage: (count) => (count === 1 ? 'Showing 1 event' : `Showing ${count} events`),
    resultMessageArabic: (count) => (count === 1 ? 'تم العثور على حدث واحد' : `تم العثور على ${count} من الأحداث`),
  },
};

function formatResultMessage(count: number, locale: Locale): string {
  const t = translations[locale];
  return locale === 'ar' ? t.resultMessageArabic(count) : t.resultMessage(count);
}

function loadStoredBookmarks(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(BOOKMARK_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item): Bookmark => ({
        id: String(item.id ?? ''),
        label: String(item.label ?? ''),
        url: String(item.url ?? ''),
        eras: Array.isArray(item.eras) ? item.eras.map(String) : [],
        logic: item.logic === 'and' ? 'and' : 'or',
        query: String(item.query ?? ''),
      }))
      .filter((item) => item.label && item.url);
  } catch {
    return [];
  }
}

export default function TimelineFilters({
  eras,
  locale = 'en',
  resultCount,
}: {
  eras: Era[];
  locale?: Locale;
  resultCount: number;
}) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const [logic, setLogic] = React.useState<'and' | 'or'>(
    sp.get('logic') === 'and' ? 'and' : 'or'
  );
  const selectedEras = React.useMemo(() => {
    const rawValues = sp.getAll('eras');
    const ids = rawValues
      .flatMap((value) => value.split(','))
      .map((value) => value.trim())
      .filter(Boolean);
    return new Set(ids);
  }, [sp]);

  const [announcement, setAnnouncement] = React.useState(() =>
    formatResultMessage(resultCount, locale)
  );
  const [bookmarkAnnouncement, setBookmarkAnnouncement] = React.useState('');
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);

  const isArabic = locale === 'ar';
  const t = translations[locale];

  const chipRefs = React.useRef(new Map<string, HTMLButtonElement>());

  React.useEffect(() => {
    setAnnouncement(formatResultMessage(resultCount, locale));
  }, [resultCount, locale]);

  React.useEffect(() => {
    setLogic(sp.get('logic') === 'and' ? 'and' : 'or');
    setQ(sp.get('q') ?? '');
  }, [sp]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    setBookmarks(loadStoredBookmarks());
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(bookmarks));
    } catch {
      // ignore storage errors in restricted environments
    }
  }, [bookmarks]);

  function commitParams(params: URLSearchParams) {
    const qs = params.toString();
    replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }

  function update(param: string, value?: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    commitParams(params);
  }

  function buildBookmarkUrl(currentLogic: 'and' | 'or', currentQuery: string, erasSet: Set<string>) {
    const params = new URLSearchParams();
    if (currentQuery.trim()) params.set('q', currentQuery.trim());
    if (erasSet.size) params.set('eras', Array.from(erasSet).join(','));
    if (currentLogic === 'and') params.set('logic', 'and');
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  function toggleEra(id: string) {
    const next = new Set(selectedEras);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const params = new URLSearchParams(sp.toString());
    if (next.size) params.set('eras', Array.from(next).join(','));
    else params.delete('eras');
    commitParams(params);
  }

  function toggleLogic(nextLogic: 'and' | 'or') {
    setLogic(nextLogic);
    if (nextLogic === 'and') {
      update('logic', 'and');
    } else {
      update('logic', undefined);
    }
  }

  function clearFilters() {
    setQ('');
    setLogic('or');
    setBookmarkAnnouncement('');
    const params = new URLSearchParams();
    commitParams(params);
  }

  function handleFormKeyDown(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      clearFilters();
      setBookmarkAnnouncement('');
    }
  }

  function handleChipKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, id: string) {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    const ids = eras.map((era) => era.id).filter(Boolean);
    const currentIndex = ids.indexOf(id);
    if (currentIndex === -1) return;
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + ids.length) % ids.length;
    const nextId = ids[nextIndex];
    const nextButton = chipRefs.current.get(nextId);
    nextButton?.focus();
  }

  function saveCurrentFilters() {
    if (typeof window === 'undefined') return;
    const label = window.prompt(t.prompt, t.defaultBookmarkName);
    if (!label) return;
    const erasArray = Array.from(selectedEras);
    const bookmark: Bookmark = {
      id: `${Date.now()}`,
      label,
      url: buildBookmarkUrl(logic, q, selectedEras),
      eras: erasArray,
      logic,
      query: q,
    };
    setBookmarks((prev) => {
      const next = prev.filter((item) => item.label !== label);
      next.push(bookmark);
      next.sort((a, b) => a.label.localeCompare(b.label));
      return next;
    });
    setBookmarkAnnouncement(t.savedBookmark(label));
  }

  function applyBookmark(bookmark: Bookmark) {
    setLogic(bookmark.logic);
    setQ(bookmark.query);
    replace(bookmark.url, { scroll: false });
    setBookmarkAnnouncement(t.appliedBookmark(bookmark.label));
  }

  async function copyBookmarkLink(bookmark: Bookmark) {
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      setBookmarkAnnouncement(t.copyError);
      return;
    }
    try {
      const absolute = new URL(bookmark.url, window.location.origin).toString();
      await navigator.clipboard.writeText(absolute);
      setBookmarkAnnouncement(t.copiedBookmark(bookmark.label));
    } catch {
      setBookmarkAnnouncement(t.copyError);
    }
  }

  function deleteBookmark(id: string) {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    const removed = bookmarks.find((bookmark) => bookmark.id === id);
    if (removed) {
      setBookmarkAnnouncement(t.deletedBookmark(removed.label));
    }
  }

  const chipBaseClasses =
    'inline-flex cursor-pointer select-none rounded-full border px-3 py-1 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const logicButtonClasses =
    'inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

  const bookmarkList = bookmarks;

  return (
    <form
      role="search"
      method="get"
      action={pathname}
      className="mb-6 space-y-4"
      dir={isArabic ? 'rtl' : 'ltr'}
      onKeyDown={handleFormKeyDown}
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
          {t.logicGroupLabel}
        </legend>
        <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`} role="group">
          <button
            type="button"
            className={`${logicButtonClasses} ${
              logic === 'or' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
            aria-pressed={logic === 'or'}
            onClick={() => toggleLogic('or')}
            title={t.applyLogicOr}
          >
            {t.logicOr}
          </button>
          <button
            type="button"
            className={`${logicButtonClasses} ${
              logic === 'and' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}
            aria-pressed={logic === 'and'}
            onClick={() => toggleLogic('and')}
            title={t.applyLogicAnd}
          >
            {t.logicAnd}
          </button>
        </div>
      </fieldset>

      <fieldset className={`m-0 border-0 p-0 ${isArabic ? 'text-right' : ''}`}>
        <legend className={`mb-2 text-sm font-medium text-gray-700 ${isArabic ? 'text-right' : ''}`}>
          {t.legend}
        </legend>
        <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`} role="group" aria-label={t.legend}>
          {eras.map((era) => {
            const label = isArabic ? era.title_ar ?? era.title : era.title;
            const selected = selectedEras.has(era.id);
            const stateClasses = selected
              ? 'border-gray-900 bg-gray-900 text-white'
              : 'border-gray-300 text-gray-900 hover:bg-gray-100';
            return (
              <button
                type="button"
                key={era.id}
                className={`${chipBaseClasses} ${stateClasses}`}
                aria-pressed={selected}
                aria-controls="timeline-results"
                aria-label={t.filterAria(label)}
                onClick={() => toggleEra(era.id)}
                data-selected={selected ? 'true' : 'false'}
                onKeyDown={(event) => handleChipKeyDown(event, era.id)}
                ref={(node) => {
                  if (node) chipRefs.current.set(era.id, node);
                  else chipRefs.current.delete(era.id);
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className={`flex flex-wrap gap-2 ${isArabic ? 'justify-end' : ''}`}>
        <input type="hidden" name="eras" value={Array.from(selectedEras).join(',')} />
        <input type="hidden" name="logic" value={logic === 'and' ? 'and' : ''} />
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={clearFilters}
        >
          {t.clear}
        </button>
        <button
          type="button"
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={saveCurrentFilters}
        >
          {t.save}
        </button>
      </div>

      {bookmarkList.length > 0 ? (
        <section aria-label={t.bookmarksHeading} className="rounded border px-3 py-2 text-xs text-gray-700">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-600">
            {t.bookmarksHeading}
          </h3>
          <ul className="mt-2 space-y-2">
            {bookmarkList.map((bookmark) => (
              <li key={bookmark.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{bookmark.label}</span>
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-2 hover:no-underline"
                  onClick={() => applyBookmark(bookmark)}
                >
                  {t.applyBookmark}
                </button>
                <button
                  type="button"
                  className="underline decoration-dotted underline-offset-2 hover:no-underline"
                  onClick={() => copyBookmarkLink(bookmark)}
                >
                  {t.copyBookmark}
                </button>
                <button
                  type="button"
                  className="text-red-600 underline decoration-dotted underline-offset-2 hover:no-underline"
                  onClick={() => deleteBookmark(bookmark.id)}
                  aria-label={`${t.deleteBookmark} ${bookmark.label}`}
                >
                  {t.deleteBookmark}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="text-xs text-gray-500">{t.emptyBookmarks}</p>
      )}

      <div aria-live="polite" className="sr-only">
        {announcement}
        {bookmarkAnnouncement ? ` ${bookmarkAnnouncement}` : ''}
      </div>
    </form>
  );
}
