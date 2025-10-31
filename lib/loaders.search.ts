// lib/loaders.search.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

// NOTE: We don't pull places here yet. If/when we have Arabic place titles or bilingual data,
// we can add them similarly to timeline (push both 'en' and 'ar' entries).

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, 'content', 'chapters');

export type SearchDoc = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang?: 'en' | 'ar';
};

/** Infer 'ar' from filename or front-matter; else 'en' */
function inferLang(slug: string, fm: Record<string, any>): 'en' | 'ar' {
  const fmLang = (fm.language ?? fm.lang)?.toString().toLowerCase();
  if (fmLang === 'ar') return 'ar';
  if (slug.endsWith('.ar')) return 'ar';
  return 'en';
}

/** Normalize href based on language and chapter slug (without .ar) */
function chapterHref(baseSlug: string, lang: 'en' | 'ar'): string {
  return lang === 'ar' ? `/ar/chapters/${baseSlug}` : `/chapters/${baseSlug}`;
}

/** Chapters: one SearchDoc per MDX file, with correct locale + href */
function loadChapterDocs(): SearchDoc[] {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.mdx'));
  const docs: SearchDoc[] = [];

  for (const f of files) {
    const raw = fs.readFileSync(path.join(CHAPTERS_DIR, f), 'utf8');
    const { data: fm } = matter(raw);
    const slug = f.replace(/\.mdx$/, '');               // e.g. "001-prologue" or "001-prologue.ar"
    const lang = inferLang(slug, fm);
    const baseSlug = slug.replace(/\.ar$/, '');         // remove possible ".ar" suffix

    docs.push({
      title: String(fm.title ?? ''),
      summary: String(fm.summary ?? ''),
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      href: chapterHref(baseSlug, lang),
      lang,
    });
  }

  return docs;
}

/** Timeline: push both 'en' and 'ar' entries so /ar has a full list until we translate. */
function loadTimelineDocs(): SearchDoc[] {
  const events = loadTimelineEvents(); // already sorted by time
  const docs: SearchDoc[] = [];

  for (const e of events) {
    const base = {
      title: String(e.title ?? ''),
      summary: String(e.summary ?? ''),
      tags: Array.isArray(e.tags) ? e.tags.map(String) : [],
    };

    // English entry
    docs.push({
      ...base,
      href: `/timeline#${e.id}`,
      lang: 'en',
    });

    // Arabic entry (same content for now; swap to Arabic fields when YAML has title_ar/summary_ar)
    docs.push({
      ...base,
      href: `/ar/timeline#${e.id}`,
      lang: 'ar',
    });
  }

  return docs;
}

export function loadSearchDocs(): SearchDoc[] {
  // Concatenate chapters + timeline
  // If we later add places, append them here too.
  return [...loadChapterDocs(), ...loadTimelineDocs()];
}
