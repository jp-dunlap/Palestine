// app/(site)/ar/page.tsx
import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description:
    'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
} as const;

type AnyDoc = Record<string, unknown>;
function toView(d: AnyDoc) {
  const href =
    (d as any).href ??
    (d as any).url ??
    (d as any).path ??
    ((d as any).slug ? `/ar/chapters/${String((d as any).slug).replace(/\.ar$/, '')}` : '#');

  return {
    title: String((d as any).title ?? ''),
    summary: String((d as any).summary ?? ''),
    tags: Array.isArray((d as any).tags) ? (d as any).tags.map(String) : [],
    // prefer 'ar', but we'll put English items after Arabic so /ar is full
    lang: (d as any).lang ?? (d as any).language ?? 'en',
    href,
  };
}

export default function Page() {
  const all = loadSearchDocs().map(toView);

  // Arabic-first ordering (but include the rest so the page is full)
  const ar = all.filter((d) => d.lang === 'ar');
  const rest = all.filter((d) => d.lang !== 'ar');
  const docs = [...ar, ...rest];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight font-arabic">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600 font-arabic">
          سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.
        </p>
      </header>

      <div className="mb-6">
        <SearchIsland docs={docs} locale="ar" />
      </div>

      <section className="space-y-4">
        <div className="space-x-3" dir="ltr">
          <a href="/ar/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50" dir="rtl">
            استكشف الخط الزمني
          </a>
          <a href="/ar/maps" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50" dir="rtl">
            شاهد الأماكن على الخريطة
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 font-arabic">فصول مختارة</h2>
          <ul className="mt-2 list-disc pl-5 text-sm" dir="ltr">
            <li dir="rtl">
              <a className="underline hover:no-underline" href="/ar/chapters/001-prologue">
                المقدّمة — عن الأسماء والذاكرة والعودة
              </a>
            </li>
            <li dir="rtl">
              <a className="underline hover:no-underline" href="/ar/chapters/002-foundations-canaanite-networks">
                الأسس — الشبكات الحضرية الكنعانية (-2000 إلى -1200)
              </a>
            </li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-600" dir="rtl">
        <a className="underline hover:no-underline" href="/">
          عرض هذا الموقع بالإنجليزية →
        </a>
      </p>

      <footer className="mt-12 text-xs text-gray-500">Code: MIT · Content: CC BY-SA 4.0</footer>
    </main>
  );
}
