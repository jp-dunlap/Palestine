// app/(site)/page.tsx
import dynamic from 'next/dynamic';
import { loadSearchDocs } from '@/lib/loaders.search';

export const metadata = {
  title: 'Palestine',
  description:
    'A public, art-grade digital history spanning 4,000 years — centering Palestinian life, sources, and anti-colonial memory.',
  alternates: { languages: { ar: '/ar' } },
} as const;

const Search = dynamic(() => import('@/components/Search'), { ssr: false, loading: () => null });

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
    <main className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">Palestine</h1>
        <p className="mt-2 text-base text-gray-600">
          A public, art-grade digital history spanning 4,000 years — centering Palestinian life,
          sources, and anti-colonial memory.
        </p>
      </header>

      {/* Client-only island; avoid hydration claims on this subtree */}
      <div className="mb-6" suppressHydrationWarning>
        <Search docs={docs} />
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
          <ul className="mt-2 list-disc pl-5 text-sm">
            <li>
              <a className="underline hover:no-underline" href="/chapters/001-prologue">
                Prologue — On Names, Memory, and Return
              </a>
            </li>
            <li>
              <a className="underline hover:no-underline" href="/chapters/002-foundations-canaanite-networks">
                Foundations — Canaanite Urban Networks (-2000 to -1200)
              </a>
            </li>
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
