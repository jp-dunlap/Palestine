import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';
import type { SearchDoc } from '@/lib/search.types';
import { translatePlain } from '@/lib/translate';

async function translateWithFallback(input: string, fallback = ''): Promise<string> {
  if (!input) return fallback;
  try {
    return await translatePlain(input, 'en', 'ar');
  } catch {
    return fallback;
  }
}

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, 'content', 'chapters');

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

    const hrefEn = `/chapters/${baseSlug}`;
    const englishDoc: SearchDoc = {
      id: hrefEn,
      title: String(fm.title ?? ''),
      summary: String(fm.summary ?? ''),
      tags: normaliseTags(fm.tags),
      href: hrefEn,
      lang: 'en',
      type: 'chapter',
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
      titleAr = await translateWithFallback(englishDoc.title);
    }
    if (!hasArabic(titleAr)) {
      continue;
    }

    let summaryAr = nativeSummary ? String(nativeSummary) : '';
    if (!summaryAr && englishDoc.summary) {
      const s = await translateWithFallback(englishDoc.summary);
      summaryAr = hasArabic(s) ? s : '';
    }

    const tagCandidates = normaliseTags(nativeTags);
    let tags: string[] = [];
    if (tagCandidates.length) {
      tags = tagCandidates;
    } else {
      const enTags = Array.isArray(englishDoc.tags) ? englishDoc.tags : [];
      if (enTags.length > 0) {
        const translated = await Promise.all(
          enTags.map((tag: string) => translateWithFallback(tag))
        );
        tags = translated.filter((t) => t && typeof t === 'string');
      }
    }

    const hrefAr = `/ar/chapters/${baseSlug}`;
    docs.push({
      id: hrefAr,
      title: titleAr,
      summary: summaryAr,
      tags,
      href: hrefAr,
      lang: 'ar',
      type: 'chapter',
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

    const hrefEn = `/timeline#${event.id}`;
    docs.push({
      id: hrefEn,
      ...english,
      href: hrefEn,
      lang: 'en',
      type: 'event',
    });

    const arTitleNative = event.title_ar ? String(event.title_ar) : '';
    let arTitle = arTitleNative;
    if (!arTitle) {
      arTitle = await translateWithFallback(english.title);
    }

    const arSummaryNative = event.summary_ar ? String(event.summary_ar) : '';
    let arSummary = arSummaryNative;
    if (!arSummary && english.summary) {
      const s = await translateWithFallback(english.summary);
      arSummary = hasArabic(s) ? s : '';
    }

    let arTags: string[] = [];
    if (Array.isArray(event.tags_ar) && event.tags_ar.length > 0) {
      arTags = event.tags_ar.map(String);
    } else if (english.tags.length > 0) {
      const translated = await Promise.all(
        english.tags.map((tag: string) => translateWithFallback(tag))
      );
      arTags = translated.filter((t) => t && typeof t === 'string');
    }

    const hasArSignal =
      hasArabic(arTitle) ||
      hasArabic(arSummary) ||
      (Array.isArray(arTags) && arTags.some((t) => hasArabic(t)));

    if (!hasArSignal) {
      continue;
    }

    const hrefAr = `/ar/timeline#${event.id}`;
    docs.push({
      id: hrefAr,
      title: arTitle || english.title,
      summary: arSummary,
      tags: arTags,
      href: hrefAr,
      lang: 'ar',
      type: 'event',
    });
  }

  return docs;
}

export async function loadSearchDocs(): Promise<SearchDoc[]> {
  const [chapters, timeline] = await Promise.all([loadChapterDocs(), loadTimelineDocs()]);
  return [...chapters, ...timeline];
}
