// app/(site)/ar/page.tsx
import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description: 'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
} as const;

type AnyDoc = Record<string, unknown>;
function toView(d: AnyDoc) {
  const href =
    (d as any).href ??
    (d as any).url ??
    (d as any).path ??
    ((d as any).slug ? `/chapters/${(d as any).slug}` : '#');

  return {
    title: String((d as any).title ?? ''),
    summary: String((d as any).summary ?? ''),
    tags: Array.isArray((d as any).tags) ? (d as any).tags.map(String) : [],
    lang: ((d as any).lang ?? (d as any).language) as 'en' | 'ar' | undefined,
    href,
  };
}

function isArabic(doc: ReturnType<typeof toView>) {
  // Prefer explicit language; also accept locale-prefixed hrefs
  return doc.lang === 'ar' || (typeof doc.href === 'string' && doc.href.startsWith('/ar/'));
}

export default function Page() {
  const all = loadSearchDocs().map(toView);

  // Strict Arabic-first policy on the Arabic homepage:
  const arOnly = all.filter(isArabic);

  // If there are no Arabic docs yet, gracefully fall back to everything
  const docs = arOnly.length > 0 ? arOnly : all;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" lang="ar" dir="rtl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight font-arabic">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600 font-arabic">
          سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.
        </p>
      </header>

      {/* عميل فقط لتفادي أخطاء الترطيب */}
      <div className="mb-6">
        <SearchIsland docs={docs} />
      </div>

      <section className="space-y-4" dir="ltr">
        <div className="space-x-3">
          <a href="/ar/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            استكشف الخط الزمني
          </a>
          <a href="/ar/maps" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            شاهد الأماكن على الخريطة
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700">فصول مختارة</h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>
              <a className="underline hover:no-underline" href="/ar/chapters/001-prologue">
                المقدّمة — عن الأسماء والذاكرة والعودة
              </a>
            </li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-600" dir="ltr">
        <a className="underline hover:no-underline" href="/">
          عرض هذا الموقع بالإنجليزية →
        </a>
      </p>

      <footer className="mt-12 text-xs text-gray-500" dir="ltr">
        Code: MIT · Content: CC BY-SA 4.0
      </footer>
    </main>
  );
}
