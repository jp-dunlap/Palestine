// app/(site)/ar/page.tsx
import dynamic from 'next/dynamic';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description:
    'تأريخ رقمي عامّ لفلسطين يمتد عبر ٤٠٠٠ سنة — يركز على الحياة الفلسطينية والمصادر والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
} as const;

// Client-only Search to avoid SSR/client ordering mismatches
const Search = dynamic(() => import('@/components/Search'), { ssr: false });

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
    lang: (d as any).lang,
    href,
  };
}

export default function Page() {
  const docs = loadSearchDocs().map(toView);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 font-arabic" dir="rtl" lang="ar">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600">
          تأريخ رقمي عامّ لفلسطين يمتد عبر ٤٠٠٠ سنة — يركز على الحياة الفلسطينية والمصادر والذاكرة المناهضة للاستعمار.
        </p>
      </header>

      <div className="mb-6">
        <Search docs={docs} />
      </div>

      <section className="space-y-4" dir="ltr">
        <div className="space-x-3">
          <a href="/ar/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            استكشف الخط الزمني
          </a>
          <a href="/ar/maps" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            عرض الأماكن على الخريطة
          </a>
        </div>
      </section>

      <p className="mt-10 text-sm text-gray-600">
        <a className="underline hover:no-underline" href="/">
          عرض هذه الصفحة بالإنجليزية →
        </a>
      </p>

      <footer className="mt-12 text-xs text-gray-500">Code: MIT · Content: CC BY-SA 4.0</footer>
    </main>
  );
}
