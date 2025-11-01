import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimelineEvents } from '@/lib/loaders.timeline';
import { hasArabic, translateToArabic, translateListToArabic } from '@/lib/i18n.translate';

export type SearchDoc = {
  title: string;
  summary: string;
  tags: string[];
  href: string;
  lang: 'en' | 'ar';
};

const ROOT = process.cwd();
const CHAPTERS_DIR = path.join(ROOT, 'content', 'chapters');

function arr(v: any): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function nonEmpty(s: unknown): s is string {
  return typeof s === 'string' && s.trim().length > 0;
}

function chapterHref(baseSlug: string, lang: 'en' | 'ar') {
  return lang === 'ar' ? `/ar/chapters/${baseSlug}` : `/chapters/${baseSlug}`;
}

function pickArabicFromRecord(r: Record<string, any>) {
  const fm = r ?? {};
  const title =
    fm.title_ar ??
    fm['title-ar'] ??
    fm.ar?.title ??
    fm.translations?.ar?.title ??
    fm.i18n?.ar?.title;
  const summary =
    fm.summary_ar ??
    fm['summary-ar'] ??
    fm.ar?.summary ??
    fm.translations?.ar?.summary ??
    fm.i18n?.ar?.summary;
  const tags =
    fm.tags_ar ??
    fm['tags-ar'] ??
    fm.ar?.tags ??
    fm.translations?.ar?.tags ??
    fm.i18n?.ar?.tags ??
    [];
  return { title, summary, tags: arr(tags) };
}

async function loadChapterDocs(): Promise<{ en: SearchDoc[]; ar: SearchDoc[] }> {
  if (!fs.existsSync(CHAPTERS_DIR)) return { en: [], ar: [] };
  const files = fs.readdirSync(CHAPTERS_DIR).filter((f) => f.endsWith('.mdx')).sort();
  const groups = new Map<string, { base: string; enPath?: string; arPath?: string }>();

  for (const f of files) {
    const slug = f.replace(/\.mdx$/, '');
    const base = slug.replace(/\.ar$/, '');
    const isAr = slug.endsWith('.ar');
    const prev = groups.get(base) || { base };
    if (isAr) prev.arPath = path.join(CHAPTERS_DIR, f);
    else prev.enPath = path.join(CHAPTERS_DIR, f);
    groups.set(base, prev);
  }

  const enOut: SearchDoc[] = [];
  const arOut: SearchDoc[] = [];

  for (const { base, enPath, arPath } of groups.values()) {
    let fmEn: Record<string, any> = {};
    let fmAr: Record<string, any> = {};

    if (enPath && fs.existsSync(enPath)) {
      const raw = fs.readFileSync(enPath, 'utf8');
      fmEn = matter(raw).data || {};
    }
    if (arPath && fs.existsSync(arPath)) {
      const raw = fs.readFileSync(arPath, 'utf8');
      fmAr = matter(raw).data || {};
    }

    const enTitle = String(fmEn.title ?? '');
    const enSummary = String(fmEn.summary ?? '');
    const enTags = arr(fmEn.tags);

    if (nonEmpty(enTitle)) {
      enOut.push({
        title: enTitle,
        summary: enSummary,
        tags: enTags,
        href: chapterHref(base, 'en'),
        lang: 'en',
      });
    }

    const pref = pickArabicFromRecord(fmEn);
    const fromArFile = pickArabicFromRecord(fmAr);

    const rawArTitle = fromArFile.title ?? pref.title ?? fmAr.title ?? fmEn.title ?? '';
    const rawArSummary = fromArFile.summary ?? pref.summary ?? fmAr.summary ?? fmEn.summary ?? '';
    const rawArTags = fromArFile.tags?.length ? fromArFile.tags : pref.tags?.length ? pref.tags : arr(fmAr.tags);

    let arTitle = nonEmpty(rawArTitle) && hasArabic(rawArTitle) ? String(rawArTitle) : '';
    let arSummary = nonEmpty(rawArSummary) && hasArabic(rawArSummary) ? String(rawArSummary) : '';
    let arTags = (rawArTags || []).filter((t) => hasArabic(t));

    if (!arTitle && nonEmpty(enTitle)) arTitle = await translateToArabic(enTitle);
    if (!arSummary && nonEmpty(enSummary)) arSummary = await translateToArabic(enSummary);
    if (arTags.length === 0 && enTags.length) arTags = await translateListToArabic(enTags);

    if (nonEmpty(arTitle)) {
      arOut.push({
        title: arTitle,
        summary: arSummary || '',
        tags: arTags,
        href: chapterHref(base, 'ar'),
        lang: 'ar',
      });
    }
  }

  return { en: enOut, ar: arOut };
}

async function loadTimelineDocs(): Promise<{ en: SearchDoc[]; ar: SearchDoc[] }> {
  const events: any[] = loadTimelineEvents() as any[];
  const enOut: SearchDoc[] = [];
  const arOut: SearchDoc[] = [];

  for (const e of events) {
    const enTitle = String(
      e.title ?? e.en?.title ?? e.translations?.en?.title ?? e.i18n?.en?.title ?? ''
    );
    const enSummary = String(
      e.summary ?? e.en?.summary ?? e.translations?.en?.summary ?? e.i18n?.en?.summary ?? ''
    );
    const enTags = arr(e.tags ?? e.en?.tags ?? e.translations?.en?.tags ?? e.i18n?.en?.tags ?? []);

    if (nonEmpty(enTitle)) {
      enOut.push({
        title: enTitle,
        summary: enSummary,
        tags: enTags,
        href: `/timeline#${e.id}`,
        lang: 'en',
      });
    }

    const rawArTitle =
      e.title_ar ?? e.ar?.title ?? e.translations?.ar?.title ?? e.i18n?.ar?.title ?? '';
    const rawArSummary =
      e.summary_ar ?? e.ar?.summary ?? e.translations?.ar?.summary ?? e.i18n?.ar?.summary ?? '';
    const rawArTags =
      e.tags_ar ?? e.ar?.tags ?? e.translations?.ar?.tags ?? e.i18n?.ar?.tags ?? [];

    let arTitle = nonEmpty(rawArTitle) && hasArabic(rawArTitle) ? String(rawArTitle) : '';
    let arSummary = nonEmpty(rawArSummary) && hasArabic(rawArSummary) ? String(rawArSummary) : '';
    let arTags = arr(rawArTags).filter((t) => hasArabic(t));

    if (!arTitle && nonEmpty(enTitle)) arTitle = await translateToArabic(enTitle);
    if (!arSummary && nonEmpty(enSummary)) arSummary = await translateToArabic(enSummary);
    if (arTags.length === 0 && enTags.length) arTags = await translateListToArabic(enTags);

    if (nonEmpty(arTitle)) {
      arOut.push({
        title: arTitle,
        summary: arSummary || '',
        tags: arTags,
        href: `/ar/timeline#${e.id}`,
        lang: 'ar',
      });
    }
  }

  return { en: enOut, ar: arOut };
}

export async function loadSearchDocs(): Promise<SearchDoc[]> {
  const chapters = await loadChapterDocs();
  const timeline = await loadTimelineDocs();
  return [...chapters.en, ...timeline.en, ...chapters.ar, ...timeline.ar];
}
