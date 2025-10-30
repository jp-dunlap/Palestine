import { loadChapterFrontmatter, loadChapterSlugs } from '@/lib/loaders.chapters';

// Next.js static params (so routing works when we build later)
export function generateStaticParams() {
  return loadChapterSlugs().map(slug => ({ slug }));
}

type Props = { params: { slug: string } };

export default function Page({ params }: Props) {
  const meta = loadChapterFrontmatter(params.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>
      <div className="mt-2 text-sm text-gray-600">
        <span>Era:</span> <code>{meta.era}</code> · <span>Authors:</span>{' '}
        {meta.authors?.join(', ')}
      </div>
      {meta.summary && <p className="mt-4">{meta.summary}</p>}
      {meta.places?.length ? (
        <p className="mt-2 text-sm text-gray-600">Places: {meta.places.join(', ')}</p>
      ) : null}
      {meta.tags?.length ? (
        <p className="mt-1 text-xs text-gray-500">Tags: {meta.tags.join(', ')}</p>
      ) : null}

      <div className="mt-8 rounded border p-3 text-sm text-gray-600">
        Body rendering (MDX) not enabled yet. This page is reading
        <br />
        <code>{meta._file.replace(process.cwd() + '/', '')}</code> frontmatter only.
      </div>
    </main>
  );
}
