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
        <SearchIsland docs={docs} />
      </div>
      <section className="space-y-4">
        <div className="space-x-3" dir="ltr">
          <a
            href="/ar/timeline"
            className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            استكشف الخطّ الزمني
          </a>
        </div>
      </section>
    </main>
  );
}
