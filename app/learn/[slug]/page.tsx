import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import JsonLd from '@/components/JsonLd';
import { createMdxComponents } from '@/mdx-components';
import {
  loadLessonFrontmatter,
  loadLessonSlugs,
  loadLessonSource,
} from '@/lib/loaders.lessons';

export function generateStaticParams() {
  return loadLessonSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  try {
    const fm = loadLessonFrontmatter(params.slug);
    const canonical = `/learn/${params.slug}`;
    return {
      title: fm.title,
      description: fm.summary,
      alternates: {
        canonical,
        languages: { en: canonical, 'x-default': canonical },
      },
      openGraph: {
        title: fm.title,
        description: fm.summary,
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title: fm.title,
        description: fm.summary,
      },
    };
  } catch (err) {
    console.warn('[lessons] missing metadata for', params.slug, err);
    return { title: 'Learning module' };
  }
}

export default async function LessonPage({ params }: { params: { slug: string } }) {
  let source: string;
  try {
    source = loadLessonSource(params.slug);
  } catch {
    notFound();
  }

  const frontmatter = loadLessonFrontmatter(params.slug);
  const { components } = createMdxComponents('en');

  const lessonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    headline: frontmatter.title,
    description: frontmatter.summary ?? undefined,
    inLanguage: 'en',
    url: `/learn/${params.slug}`,
    dateModified: frontmatter.updated
      ? new Date(frontmatter.updated).toISOString()
      : undefined,
    keywords:
      Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0
        ? frontmatter.tags
        : undefined,
  } as const;

  const { content } = await compileMDX({
    source,
    components,
    options: { parseFrontmatter: false },
  });

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{frontmatter.title}</h1>
      {frontmatter.summary ? <p className="mt-2 text-base text-gray-600">{frontmatter.summary}</p> : null}
      {frontmatter.updated ? (
        <p className="mt-2 text-xs text-gray-500">Last updated {frontmatter.updated}</p>
      ) : null}

      <div className="mt-4 text-sm text-gray-600">
        <button
          type="button"
          className="rounded border px-3 py-1 text-xs text-gray-500"
          aria-disabled="true"
        >
          العربية — قريبًا
        </button>
      </div>

      <JsonLd id={`ld-lesson-${params.slug}`} data={lessonLd} />

      <article className="prose prose-sm mt-8 max-w-none prose-a:text-blue-600 hover:prose-a:underline">
        {content}
      </article>

      <footer className="mt-12 text-sm text-gray-600">
        Want to share materials from your class or workshop?{' '}
        <a className="underline hover:no-underline" href="/submit">
          Send them to the collective.
        </a>
      </footer>
    </main>
  );
}
