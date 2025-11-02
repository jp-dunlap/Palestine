import { notFound } from 'next/navigation';
import { compileMDX } from 'next-mdx-remote/rsc';
import {
  loadChapterSlugsAr,
  loadChapterSourceAr,
  hasEnChapter,
  loadChapterFrontmatter,
  loadChapterFrontmatterAr,
  hasArChapter,
} from '@/lib/loaders.chapters';
import { mdxComponents } from '@/mdx-components';
import { loadEras } from '@/lib/loaders.timeline';
import { loadGazetteer } from '@/lib/loaders.places';

export function generateStaticParams() {
  return loadChapterSlugsAr().map(slug => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const hasAr = hasArChapter(params.slug);
  const hasEn = hasEnChapter(params.slug);
  if (!hasAr && !hasEn) {
    notFound();
  }
  const { frontmatter: arFm, isFallback } = loadChapterFrontmatterAr(params.slug);
  const enFm = hasEn ? loadChapterFrontmatter(params.slug) : null;
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const title = arFm.title ?? enFm?.title ?? params.slug;
  const summary = arFm.summary ?? enFm?.summary;
  return {
    title: isFallback ? `${title} (English)` : title,
    description: summary,
    alternates: {
      languages: hasEn ? { en: `/chapters/${params.slug}` } : {},
    },
    openGraph: {
      title: isFallback ? `${title} (English)` : title,
      description: summary,
      images: url ? [`${url}/opengraph-image`] : undefined,
    },
  };
}

type Props = { params: { slug: string } };

export default async function Page({ params }: Props) {
  const hasAr = hasArChapter(params.slug);
  const hasEn = hasEnChapter(params.slug);
  if (!hasAr && !hasEn) {
    notFound();
  }
  const { source, isFallback } = loadChapterSourceAr(params.slug);
  const { content, frontmatter } = await compileMDX({
    source,
    components: mdxComponents,
    options: { parseFrontmatter: true }
  });

  const meta = frontmatter as {
    title?: string; summary?: string; authors?: string[]; places?: string[]; tags?: string[]; era?: string;
  };

  const enAvailable = hasEn;
  const enMeta = enAvailable ? loadChapterFrontmatter(params.slug) : null;

  const title = meta.title ?? enMeta?.title ?? params.slug;
  const summary = meta.summary ?? enMeta?.summary;
  const authors = meta.authors?.length ? meta.authors : enMeta?.authors;
  const places = meta.places?.length ? meta.places : enMeta?.places;
  const tags = meta.tags?.length ? meta.tags : enMeta?.tags;
  const era = (meta as any).era ?? enMeta?.era;

  const eras = loadEras();
  const eraDisplay = (() => {
    if (!era) return undefined;
    const needle = String(era).toLowerCase();
    const match = eras.find(e =>
      e.id.toLowerCase() === needle ||
      (e.title || '').toLowerCase() === needle ||
      (e.title_ar || '').toLowerCase() === needle
    );
    if (!match) return era;
    return match.title_ar ?? match.title;
  })();

  const gaz = loadGazetteer();
  const placeMap = new Map<string, string>();
  for (const p of gaz) {
    const ar = p.name_ar ?? p.name;
    placeMap.set(String(p.name).toLowerCase(), ar);
    for (const alt of p.alt_names ?? []) {
      placeMap.set(String(alt).toLowerCase(), ar);
    }
  }
  const placesAr = (places ?? []).map((p) => {
    const k = String(p).toLowerCase();
    return placeMap.get(k) ?? p;
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight font-arabic">{title}</h1>

      {summary && (
        <p className="mt-3 text-base text-gray-700 font-arabic">{summary}</p>
      )}

      {isFallback ? (
        <div className="mt-4 rounded border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800 font-arabic">
          هذه النسخة تُعرض بالإنجليزية لعدم توفر ترجمة بعد.
        </div>
      ) : null}

      <div className="mt-2 text-sm text-gray-600">
        {enAvailable ? (
          <a className="underline" href={`/chapters/${params.slug}`}>English</a>
        ) : null}
      </div>

      <dl className="mt-4 space-y-1 text-sm text-gray-600 font-arabic">
        {eraDisplay ? (
          <div>
            <dt className="inline font-semibold">العصر:</dt>{' '}
            <dd className="inline">{eraDisplay}</dd>
          </div>
        ) : null}
        {authors?.length ? (
          <div>
            <dt className="inline font-semibold">المؤلفون:</dt>{' '}
            <dd className="inline">{authors.join('، ')}</dd>
          </div>
        ) : null}
        {placesAr?.length ? (
          <div>
            <dt className="inline font-semibold">الأماكن:</dt>{' '}
            <dd className="inline">{placesAr.join('، ')}</dd>
          </div>
        ) : null}
        {tags?.length ? (
          <div>
            <dt className="inline font-semibold">الوسوم:</dt>{' '}
            <dd className="inline">#{tags.join(' #')}</dd>
          </div>
        ) : null}
      </dl>

      <article className="mt-8 space-y-4 font-arabic">
        {content}
      </article>
    </main>
  );
}
