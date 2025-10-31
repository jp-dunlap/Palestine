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
const AR_RX = /[\u0600-\u06FF]/;

function inferLang(d: AnyDoc): 'en' | 'ar' {
  const explicit = String(d.lang ?? d.language ?? '').toLowerCase();
  if (explicit === 'ar' || explicit === 'arabic') return 'ar';
  if (explicit === 'en' || explicit === 'english') return 'en';

  const href = String(d.href ?? d.url ?? '');
  const slug = String(d.slug ?? '');
  const fileHint = String(d.file ?? d.id ?? '').toLowerCase();

  // Path or filename hints
  if (href.startsWith('/ar')) return 'ar';
  if (/\.ar(\.|$)/.test(fileHint) || /\.ar(\.|$)/.test(slug)) return 'ar';

  // Content glyphs
  const text = [d.title, d.summary, ...(Array.isArray(d.tags) ? d.tags : [])]
    .filter(Boolean)
    .map(String)
    .join(' ');
  if (AR_RX.test(text)) return 'ar';

  return 'en';
}

function toView(d: AnyDoc) {
  const lang = inferLang(d);

  // Build href deterministically
  let href = String(d.href ?? d.url ?? '');
  if (!href) {
    const slug = d.slug ? String(d.slug) : '';
    if (slug) href = lang === 'ar' ? `/ar/chapters/${slug}` : `/chapters/${slug}`;
    else href = '#';
  }

  return {
    title: String((d as any).title ?? ''),
    summary: String((d as any).summary ?? ''),
    tags: Array.isArray((d as any).tags) ? (d as any).tags.map(String) : [],
    lang,
    href,
  };
}

export default function Page() {
  const all = loadSearchDocs().map(toView);
  // STRICT: English-only for root /
  const docs = all.filter((d) => d.lang === 'en');

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
