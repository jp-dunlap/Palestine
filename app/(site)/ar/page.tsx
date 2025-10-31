// app/(site)/ar/page.tsx
import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'فلسطين',
  description:
    'سجلّ عام وتاريخ رقمي فني يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية، والذاكرة المناهضة للاستعمار.',
  alternates: { languages: { en: '/' } },
} as const;

type AnyDoc = Record<string, unknown>;
function toView(d: AnyDoc) {
  const href =
    (d as any).href ??
    (d as any).url ??
    ((d as any).slug ? `/chapters/${(d as any).slug}` : '#');

  return {
    title: String((d as any).title ?? ''),
    summary: String((d as any).summary ?? ''),
    tags: Array.isArray((d as any).tags) ? (d as any).tags.map(String) : [],
    // Prefer explicit language if present, else infer Arabic for the /ar/ site.
    lang: (d as any).lang ?? (d as any).language ?? 'ar',
    href,
  };
}

export default function Page() {
  const all = loadSearchDocs().map(toView);

  // ✅ Arabic-only for /ar (no English docs mixed into the main list)
  const ar = all.filter((d) => d.lang === 'ar');

  // Search uses strictly AR docs
  const docs = ar;

  // Featured: strictly AR as well (no EN back-fill to avoid mixing)
  const featured = ar.slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight font-arabic">فلسطين</h1>
        <p className="mt-2 text-base text-gray-600 font-arabic">
          سجلّ عام وتاريخ رقمي فني يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية، والذاكرة
          المناهضة للاستعمار.
        </p>
      </header>

      <div className="mb-6">
        {/* Search is a client-only island to avoid hydration issues */}
        <SearchIsland docs={docs} />
      </div>

      <section className="space-y-4">
        <div className="space-x-3 space-x-reverse" dir="rtl">
          <a href="/ar/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            استكشف الخطّ الزمني
          </a>
          <a href="/ar/maps" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            شاهد الأماكن على الخريطة
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 font-arabic">فصول مختارة</h2>
          <ul className="mt-2 space-y-2 text-sm" dir="rtl">
            {featured.map((d) => (
              <li key={d.href}>
                <a className="underline hover:no-underline" href={d.href}>
                  {d.title}
                </a>
                {d.summary ? <div className="text-gray-600">{d.summary}</div> : null}
              </li>
            ))}
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
