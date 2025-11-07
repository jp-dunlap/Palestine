import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';
import { loadChapterFrontmatterAr } from '@/lib/loaders.chapters';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

export default async function ChapterTwitterImageAr({ params }: { params: { slug: string } }) {
  const { frontmatter, isFallback } = loadChapterFrontmatterAr(params.slug);
  const title = frontmatter.title_ar ?? frontmatter.title ?? 'فلسطين: الفصل';
  const description = frontmatter.summary_ar ?? frontmatter.summary ?? null;
  const eyebrow = isFallback ? 'الفصل • (ترجمة مؤقتة)' : 'الفصل • فلسطين';
  return createSocialImage({
    locale: 'ar',
    title,
    description,
    eyebrow,
  });
}
