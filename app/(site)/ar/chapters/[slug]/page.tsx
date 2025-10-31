import { compileMDX } from 'next-mdx-remote/rsc';
import { loadChapterSlugsAr, loadChapterSourceAr, hasEnChapter } from '@/lib/loaders.chapters';
import { mdxComponents } from '@/mdx-components';

export function generateStaticParams() {
  return loadChapterSlugsAr().map(slug => ({ slug }));
}

type Props = { params: { slug: string } };

export default async function Page({ params }: Props) {
  const source = loadChapterSourceAr(params.slug);
  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true }
  });

  const meta = frontmatter as {
    title?: string; summary?: string; authors?: string[]; places?: string[]; tags?: string[];
  };

  const enAvailable = hasEnChapter(params.slug);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight font-arabic">{meta.title}</h1>

      {meta.summary && (
        <p className="mt-3 text-base text-gray-700 font-arabic">{meta.summary}</p>
      )}

      <div className="mt-2 text-sm text-gray-600">
        {enAvailable ? (
          <a className="underline" href={`/chapters/${params.slug}`}>English</a>
        ) : null}
      </div>

      <article className="mt-8 space-y-4 font-arabic">
        {content}
      </article>
    </main>
  );
}
