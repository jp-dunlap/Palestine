// app/(site)/page.tsx
import { loadSearchDocs, type SearchDoc } from '@/lib/loaders.search';
import Search from '@/components/Search';

type SearchDocView = {
  title: string;
  summary?: string;
  tags?: string[];
  href: string;
};

function toView(d: SearchDoc): SearchDocView {
  let href = '#';
  if (d.kind === 'chapter' && d.slug) {
    href = `/chapters/${d.slug}`;
  } else if (d.kind === 'timeline') {
    href = '/timeline';
  } else if (d.kind === 'place' && d.slug) {
    href = `/places/${d.slug}`;
  }
  return {
    title: d.title,
    summary: d.summary,
    tags: d.tags,
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

      {/* Site search */}
      <div className="mb-6">
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
          <h2 className="text-sm font-semibold text-gray-700">Featured c
