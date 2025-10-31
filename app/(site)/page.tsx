// app/(site)/page.tsx
import SearchIsland from '@/components/SearchIsland';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'Palestine',
  description:
    'A public, art-grade digital history spanning 4,000 years — centering Palestinian life, sources, and anti-colonial memory.',
  alternates: { languages: { ar: '/ar' } },
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
    lang: (d as any).lang ?? (d as any).language ?? 'en',
    href,
  };
}

export default function Page() {
  const all = loadSearchDocs().map(toView);
  const en = all.filter((d) => d.lang === 'en');
  const ar = all.filter((d) => d.lang === 'ar');

  // Search shows EN first on /
  const docs = [...en, ...ar];

  // Featured: show up to 3 EN; if fewer, back-fill with AR
  const featured = [...en.slice(0, 3), ...ar.slice(0, Math.max(0, 3 - en.length))];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Palestine</h1>
        <p className="mt-2 text-base text-gray-600">
          A public, art-grade digital history spanning 4,000 years — centering Palestinian life,
          sources, and anti-colonial memory.
        </p>
      </header>

      <div className="mb-6">
        <SearchIsland docs={docs} />
      </div>

      <section className="space-y-4">
        <div className="space-x-3">
          <a href="/timeline" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            Explore the timeline
          </a>
          <a href="/maps" className="inline-block rounded border px-3 py-2 text-sm hover:bg-gray-50">
            View places on the map
          </a>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700">Featured chapters</h2>
          <ul className="mt-2 space-y-2 text-sm">
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

      <p className="mt-10 text-sm text-gray-600">
        <a className="underline hover:no-underline" href="/ar">
          View this site in Arabic →
        </a>
      </p>

      <footer className="mt-12 text-xs text-gray-500">Code: MIT · Content: CC BY-SA 4.0</footer>
    </main>
  );
}
