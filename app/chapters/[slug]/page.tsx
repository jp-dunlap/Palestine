import { loadChapterSlugs, loadChapterSource, loadChapterFrontmatter, hasArChapter } from '@/lib/loaders.chapters';
import { compileMDX } from 'next-mdx-remote/rsc';
import { formatSources } from '@/lib/bibliography';
import { mdxComponents } from '@/mdx-components';

export function generateStaticParams() {
  return loadChapterSlugs().map(slug => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const fm = loadChapterFrontmatter(params.slug);
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const ar = hasArChapter(params.slug);
  return {
    title: fm.title,
    description: fm.summary,
    alternates: {
      languages: ar ? { ar: `/ar/chapters/${params.slug}` } : {},
    },
    openGraph: {
      title: fm.title,
      description: fm.summary,
      images: url ? [`${url}/opengraph-image`] : undefined,
    },
  };
}

type Props = { params: { slug: string } };

export default async function Page({ params }: Props) {
  const source = loadChapterSource(params.slug);

  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true }
  });

  const meta = frontmatter as {
    title?: string;
    era?: string;
    authors?: string[];
    summary?: string;
    places?: string[];
    tags?: string[];
    sources?: Array<{ id?: string; url?: string }>;
  };

  const renderedSources = meta.sources ? formatSources(meta.sources) : [];

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

      {renderedSources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold text-gray-700">Sources</h2>
          <ol className="mt-2 list-decimal pl-6 text-sm text-gray-700 space-y-1">
            {renderedSources.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
