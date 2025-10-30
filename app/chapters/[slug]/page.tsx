import { loadChapterSlugs, loadChapterSource } from '@/lib/loaders.chapters';
import { compileMDX } from 'next-mdx-remote/rsc';

export function generateStaticParams() {
  return loadChapterSlugs().map(slug => ({ slug }));
}

type Props = { params: { slug: string } };

export default async function Page({ params }: Props) {
  const source = loadChapterSource(params.slug);

  // compileMDX will parse frontmatter for us
  const { content, frontmatter } = await compileMDX({
    source,
    options: { parseFrontmatter: true }
  });

  const meta = frontmatter as {
    title?: string;
    era?: string;
    authors?: string[];
    summary?: string;
    places?: string[];
    tags?: string[];
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>

      <div className="mt-2 text-sm text-gray-600">
        {meta.era ? (<><span>Era:</span> <code>{meta.era}</code></>) : null}
        {meta.authors?.length ? <> · <span>Authors:</span> {meta.authors.join(', ')}</> : null}
      </div>

      {meta.summary && <p className="mt-4">{meta.summary}</p>}
      {meta.places?.length ? (
        <p className="mt-2 text-sm text-gray-600">Places: {meta.places.join(', ')}</p>
      ) : null}
      {meta.tags?.length ? (
        <p className="mt-1 text-xs text-gray-500">Tags: {meta.tags.join(', ')}</p>
      ) : null}

      <article className="mt-8 space-y-4">
        {content}
      </article>
    </main>
  );
}
