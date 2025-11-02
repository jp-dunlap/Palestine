import { NextResponse } from 'next/server';
import { loadChapterFrontmatter, loadChapterSlugs } from '@/lib/loaders.chapters';

export const dynamic = 'force-static';

export async function GET() {
  const chapters = loadChapterSlugs().map((slug) => {
    const fm = loadChapterFrontmatter(slug);
    return {
      slug,
      title: fm.title,
      summary: fm.summary ?? null,
      era: fm.era ?? null,
      authors: fm.authors ?? [],
      tags: fm.tags ?? [],
      language: fm.language ?? 'en',
    };
  });

  return NextResponse.json({ chapters });
}
