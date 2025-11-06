import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';
import { hasEnChapter, loadChapterFrontmatter } from '@/lib/loaders.chapters';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function ChapterTwitterImage({ params }: { params: { slug: string } }) {
  const isAvailable = hasEnChapter(params.slug);
  const frontmatter = isAvailable ? loadChapterFrontmatter(params.slug) : null;
  return createSocialImage({
    locale: 'en',
    title: frontmatter?.title ?? 'Palestine: Chapter',
    description: frontmatter?.summary ?? null,
    eyebrow: 'CHAPTER • PALESTINE',
  });
}
