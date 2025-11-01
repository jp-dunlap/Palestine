import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description: 'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
  openGraph: {
    title: 'فلسطين',
    description: 'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
    type: 'website',
  },
};

export default async function Page() {
  const docs = (await loadSearchDocs()).filter(d => d.lang === 'ar');

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight font-arabic">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600 font-arabic">
          سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.
        </p>
      </header>

      <div className="mb-6" dir="ltr">
        <SearchIsland docs={docs} locale="ar" />
      </div>

      <p className="mt-10 text-sm text-gray-600 font-arabic">
        <a className="underline hover:no-underline" href="/">
          عرض هذا الموقع بالإنجليزية →
        </a>
      </p>
      <footer className="mt-12 text-xs text-gray-500 font-arabic">الشيفرة: MIT · المحتوى: CC BY-SA 4.0</footer>
    </main>
  );
}
