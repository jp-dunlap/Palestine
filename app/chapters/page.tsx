import { loadChapterSlugs, loadChapterFrontmatter } from '@/lib/loaders.chapters';

export default function Page() {
  const slugs = loadChapterSlugs();
  const items = slugs.map((slug) => ({ slug, meta: loadChapterFrontmatter(slug) }));

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Chapters</h1>
      <ul className="mt-6 space-y-4">
        {items.map(({ slug, meta }) => (
          <li key={slug} className="rounded border p-4 hover:bg-gray-50">
            <a className="text-base font-medium underline" href={`/chapters/${slug}`}>
              {meta.title}
            </a>
            {meta.summary && <p className="mt-1 text-sm text-gray-700">{meta.summary}</p>}
            <div className="mt-1 text-xs text-gray-600">
              Era: <code>{meta.era}</code>
              {meta.tags?.length ? <> · Tags: {meta.tags.join(', ')}</> : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
