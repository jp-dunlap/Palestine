// lib/loaders.search.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

export type SearchDoc = {
  id: string;
  kind: 'chapter' | 'timeline' | 'place';
  title: string;
  slug?: string;
  summary?: string;
  tags?: string[];
  /** language hint for deterministic home ordering */
  lang?: 'en' | 'ar';
};

/** Infer language from frontmatter or filename (e.g., 001-prologue.ar.mdx) */
function inferLang(slug: string, fmLang: unknown): 'en' | 'ar' {
  if (typeof fmLang === 'string') {
    const v = fmLang.trim().toLowerCase();
    if (v === 'ar' || v === 'arabic') return 'ar';
    if (v === 'en' || v === 'english') return 'en';
  }
  return /\.ar$/i.test(slug) ? 'ar' : 'en';
}

export function loadSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // -------- Chapters (MDX) --------
  const chapterDir = path.join(process.cwd(), 'content', 'chapters');
  if (fs.existsSync(chapterDir)) {
    const files = fs
      .readdirSync(chapterDir)
      .filter((f) => f.toLowerCase().endsWith('.mdx'))
      .sort(); // keep filesystem order stable

    for (const file of files) {
      const slug = file.replace(/\.mdx$/i, '');
      const raw = fs.readFileSync(path.join(chapterDir, file), 'utf8');
      const { data } = matter(raw);

      const title =
        (typeof data?.title === 'string' && data.title.trim()) ||
        slug.replace(/[-_]+/g, ' ');
      const summary = typeof data?.summary === 'string' ? data.summary : '';
      const tags = Array.isArray(data?.tags) ? data.tags.map(String) : [];
      const lang = inferLang(slug, (data as any)?.language);

      docs.push({
        id: `chapter:${slug}`,
        kind: 'chapter',
        title,
        slug,
        summary,
        tags,
        lang,
      });
    }
  }

  // -------- Timeline (YAML) --------
  // Treat as neutral, but default to 'en' for EN-home ordering.
  for (const ev of loadTimelineEvents()) {
    docs.push({
      id: `timeline:${ev.id}`,
      kind: 'timeline',
      title: ev.title,
      summary: ev.summary ?? '',
      tags: ev.tags ?? [],
      lang: 'en',
    });
  }

  return docs;
}
