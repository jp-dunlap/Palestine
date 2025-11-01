// lib/loaders.search.ts
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';
import { translateText } from '@/lib/translate';

// NOTE: We don't pull places here yet. If/when we have Arabic place titles or bilingual data,
// we can add them similarly to timeline (push both 'en' and 'ar' entries).

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, 'content', 'chapters');

export type SearchDoc = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang: 'en' | 'ar';
};

type ChapterFrontmatter = {
  title?: string;
  summary?: string;
  tags?: unknown;
  title_ar?: string;
  summary_ar?: string;
  tags_ar?: unknown;
};

function normaliseTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => String(tag));
}

async function loadChapterDocs(): Promise<SearchDoc[]> {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.mdx'));

  const docs: SearchDoc[] = [];

  for (const file of files) {
    if (file.endsWith('.ar.mdx')) continue; // handled when iterating English base files
    const full = path.join(CHAPTERS_DIR, file);
    const raw = fs.readFileSync(full, 'utf8');
    const { data } = matter(raw);
    const fm = data as ChapterFrontmatter;
    const baseSlug = file.replace(/\.mdx$/, '');

    const englishDoc: SearchDoc = {
      title: String(fm.title ?? ''),
      summary: String(fm.summary ?? ''),
      tags: normaliseTags(fm.tags),
      href: `/chapters/${baseSlug}`,
      lang: 'en',
    };
    docs.push(englishDoc);

    const arFile = path.join(CHAPTERS_DIR, `${baseSlug}.ar.mdx`);
    let arFm: ChapterFrontmatter | null = null;
    if (fs.existsSync(arFile)) {
      const rawAr = fs.readFileSync(arFile, 'utf8');
      const parsed = matter(rawAr);
      arFm = parsed.data as ChapterFrontmatter;
    }

    const titleAr = arFm?.title ?? fm.title_ar;
    const summaryAr = arFm?.summary ?? fm.summary_ar;
    const tagsAr = arFm?.tags ?? fm.tags_ar;

    const translatedTitle = titleAr
      ? String(titleAr)
      : await translateText(englishDoc.title, { source: 'en', target: 'ar', fallback: englishDoc.title });
    const translatedSummary = summaryAr
      ? String(summaryAr)
      : englishDoc.summary
      ? await translateText(englishDoc.summary, {
          source: 'en',
          target: 'ar',
          fallback: englishDoc.summary,
        })
      : '';

    const translatedTags = normaliseTags(tagsAr);
    let tags: string[];
    if (translatedTags.length > 0) {
      tags = translatedTags;
    } else if (englishDoc.tags.length > 0) {
      tags = await Promise.all(
        englishDoc.tags.map((tag) => translateText(tag, { source: 'en', target: 'ar', fallback: tag }))
      );
    } else {
      tags = [];
    }

    docs.push({
      title: translatedTitle,
      summary: translatedSummary,
      tags,
      href: `/ar/chapters/${baseSlug}`,
      lang: 'ar',
    });
  }

  return docs;
}

async function loadTimelineDocs(): Promise<SearchDoc[]> {
  const events = loadTimelineEvents();
  const docs: SearchDoc[] = [];

  for (const event of events) {
    const english = {
      title: String(event.title ?? ''),
      summary: String(event.summary ?? ''),
      tags: Array.isArray(event.tags) ? event.tags.map(String) : [],
    };

    docs.push({
      ...english,
      href: `/timeline#${event.id}`,
      lang: 'en',
    });

    const arTitle = event.title_ar
      ? String(event.title_ar)
      : await translateText(english.title, { source: 'en', target: 'ar', fallback: english.title });
    const arSummary = event.summary_ar
      ? String(event.summary_ar)
      : english.summary
      ? await translateText(english.summary, { source: 'en', target: 'ar', fallback: english.summary })
      : '';

    let arTags: string[] = [];
    if (Array.isArray(event.tags_ar) && event.tags_ar.length > 0) {
      arTags = event.tags_ar.map(String);
    } else if (english.tags.length > 0) {
      arTags = await Promise.all(
        english.tags.map((tag) => translateText(tag, { source: 'en', target: 'ar', fallback: tag }))
      );
    }

    docs.push({
      title: arTitle,
      summary: arSummary,
      tags: arTags,
      href: `/ar/timeline#${event.id}`,
      lang: 'ar',
    });
  }

  return docs;
}

export async function loadSearchDocs(): Promise<SearchDoc[]> {
  const [chapters, timeline] = await Promise.all([loadChapterDocs(), loadTimelineDocs()]);
  return [...chapters, ...timeline];
}
