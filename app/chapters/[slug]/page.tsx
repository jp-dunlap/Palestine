import { notFound } from 'next/navigation';
import {
  loadChapterSlugs,
  loadChapterSource,
  loadChapterFrontmatter,
  hasArChapter,
  hasEnChapter,
} from '@/lib/loaders.chapters';
import { compileMDX } from 'next-mdx-remote/rsc';
import { formatSources } from '@/lib/bibliography';
import { createMdxComponents } from '@/mdx-components';
import JsonLd from '@/components/JsonLd';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

export function generateStaticParams() {
  return loadChapterSlugs().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  if (!hasEnChapter(params.slug)) {
    notFound();
  }
  const fm = loadChapterFrontmatter(params.slug);
  const ar = hasArChapter(params.slug);
  const canonical = `/chapters/${params.slug}`;
  const languages: Record<string, string> = {
    en: canonical,
    'x-default': canonical,
  };
  if (ar) {
    languages.ar = `/ar/chapters/${params.slug}`;
  }
  return {
    title: fm.title,
    description: fm.summary,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: fm.title,
      description: fm.summary,
      images: [`/chapters/${params.slug}/opengraph-image`],
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title: fm.title,
      description: fm.summary,
      images: [`/chapters/${params.slug}/opengraph-image`],
    },
  };
}

type Props = { params: { slug: string } };

export default async function Page({ params }: Props) {
  if (!hasEnChapter(params.slug)) {
    notFound();
  }
  const source = loadChapterSource(params.slug);

  const { components, FootnotesSection } = createMdxComponents('en');

  const { content, frontmatter } = await compileMDX({
    source,
    components,
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
    date?: string;
  };

  const renderedSources = meta.sources ? formatSources(meta.sources) : [];
  const hasArabic = hasArChapter(params.slug);
  const arabicHref = hasArabic
    ? buildLanguageToggleHref(`/chapters/${params.slug}`, undefined, 'ar')
    : null;

  const articleUrl = `/chapters/${params.slug}`;

  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.summary,
    inLanguage: 'en',
    url: articleUrl,
    datePublished: meta.date ? new Date(meta.date).toISOString() : undefined,
    author: Array.isArray(meta.authors)
      ? meta.authors.map(name => ({ '@type': 'Person', name }))
      : meta.authors
        ? [{ '@type': 'Person', name: String(meta.authors) }]
        : undefined,
    articleSection: meta.era,
    keywords: meta.tags,
    mainEntityOfPage: { '@type': 'WebPage', '@id': articleUrl },
  };

  return (
    <>
      <JsonLd id={`ld-article-${params.slug}`} data={articleLd} />
      <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-semibold tracking-tight">{meta.title}</h1>

        <div className="mt-2 text-sm text-gray-600">
          {meta.era ? (<><span>Era:</span> <code>{meta.era}</code></>) : null}
          {meta.authors?.length ? <> · <span>Authors:</span> {meta.authors.join(', ')}</> : null}
        </div>

        {meta.summary && <p className="mt-4">{meta.summary}</p>}
        {arabicHref ? (
          <p className="mt-2 text-sm text-gray-600">
            <a className="underline hover:no-underline" href={arabicHref}>
              View this chapter in Arabic →
            </a>
          </p>
        ) : null}
        {meta.places?.length ? (
          <p className="mt-2 text-sm text-gray-600">Places: {meta.places.join(', ')}</p>
        ) : null}
        {meta.tags?.length ? (
          <p className="mt-1 text-xs text-gray-500">Tags: {meta.tags.join(', ')}</p>
        ) : null}

        <article className="mt-8 space-y-4">
          {content}
        </article>

        <FootnotesSection />

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
    </>
  );
}
