// app/(site)/ar/page.tsx
import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description:
    'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
} as const;

export default async function Page() {
  const docs = (await loadSearchDocs()).filter((d) => d.lang === 'ar');

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight font-arabic">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600 font-arabic">
          سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.
        </p>
      </header>

      <div className="mb-6" dir="ltr">
        {/* Keep input LTR so URLs remain readable; results are Arabic-only */}
        <SearchIsland docs={docs} locale="ar" />
      </div>

      <section className="space-y-4">
        <div className="space-x-3" dir="ltr">
          <a href="/ar/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            استكشف الخطّ الزمني
          </a>
          <a href="/ar/map" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            شاهد الأماكن على الخريطة
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 font-arabic">فصول مختارة</h2>
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>
              <a className="underline hover:no-underline" href="/ar/chapters/001-prologue">
                المقدّمة — عن الأسماء والذاكرة والعودة
              </a>
            </li>
            <li>
              <a className="underline hover:no-underline" href="/ar/chapters/002-foundations-canaanite-networks">
                الأسس — الشبكات الحضرية الكنعانية (-2000 إلى -1200)
              </a>
            </li>
          </ul>
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-600 font-arabic">
        <a className="underline hover:no-underline" href="/">
          عرض هذا الموقع بالإنجليزية →
        </a>
      </p>

      <footer className="mt-12 text-xs text-gray-500 font-arabic">الشيفرة: MIT · المحتوى: CC BY-SA 4.0</footer>
    </main>
  );
}
