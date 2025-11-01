import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';
import { translateText } from '@/lib/translate';

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

function hasArabic(s?: string): boolean {
  return typeof s === 'string' && /[\u0600-\u06FF]/.test(s);
}

async function loadChapterDocs(): Promise<SearchDoc[]> {
  if (!fs.existsSync(CHAPTERS_DIR)) return [];
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.mdx'));

  const docs: SearchDoc[] = [];

  for (const file of files) {
    if (file.endsWith('.ar.mdx')) continue;
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

    const nativeTitle = arFm?.title ?? fm.title_ar;
    const nativeSummary = arFm?.summary ?? fm.summary_ar;
    const nativeTags = arFm?.tags ?? fm.tags_ar;

    let titleAr = nativeTitle ? String(nativeTitle) : '';
    if (!titleAr) {
      const t = await translateText(englishDoc.title, { source: 'en', target: 'ar', fallback: '' });
      titleAr = t;
    }
    if (!hasArabic(titleAr)) {
      continue;
    }

    let summaryAr = nativeSummary ? String(nativeSummary) : '';
    if (!summaryAr && englishDoc.summary) {
      const s = await translateText(englishDoc.summary, { source: 'en', target: 'ar', fallback: '' });
      summaryAr = hasArabic(s) ? s : '';
    }

    const tagCandidates = normaliseTags(nativeTags);
    let tags: string[] = [];
    if (tagCandidates.length) {
      tags = tagCandidates;
    } else if (englishDoc.tags.length) {
      const translated = await Promise.all(
        englishDoc.tags.map((tag: string) =>
          translateText(tag, { source: 'en', target: 'ar', fallback: '' })
        )
      );
      tags = translated.filter((t: string) => t && typeof t === 'string');
    }

    docs.push({
      title: titleAr,
      summary: summaryAr,
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
      title: String((event as any).title ?? ''),
      summary: String((event as any).summary ?? ''),
      tags: Array.isArray((event as any).tags) ? (event as any).tags.map(String) : [],
    };

    docs.push({
      ...english,
      href: `/timeline#${(event as any).id}`,
      lang: 'en',
    });

    const ev: any = event;

    const arTitleNative = ev.title_ar ? String(ev.title_ar) : '';
    let arTitle = arTitleNative;
    if (!arTitle) {
      const t = await translateText(english.title, { source: 'en', target: 'ar', fallback: '' });
      arTitle = t;
    }

    const arSummaryNative = ev.summary_ar ? String(ev.summary_ar) : '';
    let arSummary = arSummaryNative;
    if (!arSummary && english.summary) {
      const s = await translateText(english.summary, { source: 'en', target: 'ar', fallback: '' });
      arSummary = hasArabic(s) ? s : '';
    }

    let arTags: string[] = [];
    if (Array.isArray(ev.tags_ar) && ev.tags_ar.length > 0) {
      arTags = ev.tags_ar.map(String);
    } else if (english.tags.length > 0) {
      const translated = await Promise.all(
        english.tags.map((tag: string) =>
          translateText(tag, { source: 'en', target: 'ar', fallback: '' })
        )
      );
      arTags = translated.filter((t: string) => t && typeof t === 'string');
    }

    const hasArSignal =
      hasArabic(arTitle) ||
      hasArabic(arSummary) ||
      (Array.isArray(arTags) && arTags.some((t: string) => hasArabic(t)));

    if (!hasArSignal) {
      continue;
    }

    docs.push({
      title: arTitle || english.title,
      summary: arSummary,
      tags: arTags,
      href: `/ar/timeline#${(event as any).id}`,
      lang: 'ar',
    });
  }

  return docs;
}

export async function loadSearchDocs(): Promise<SearchDoc[]> {
  const [chapters, timeline] = await Promise.all([loadChapterDocs(), loadTimelineDocs()]);
  return [...chapters, ...timeline];
}
