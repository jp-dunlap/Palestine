import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';

import { hasArChapter, hasEnChapter, loadChapterFrontmatter, loadChapterSlugsAr } from '@/lib/loaders.chapters';
import { loadLessonFrontmatter, loadLessonSlugs } from '@/lib/loaders.lessons';
import { loadGazetteer } from '@/lib/loaders.places';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine-two.vercel.app';
const nowIso = new Date().toISOString();

const chaptersDir = path.join(process.cwd(), 'content', 'chapters');
const timelineDataDir = path.join(process.cwd(), 'data', 'timeline');
const timelineContentDir = path.join(process.cwd(), 'content', 'timeline');
const gazetteerFile = path.join(process.cwd(), 'data', 'gazetteer.json');

function toAbsolute(pathname: string): string {
  return `${siteUrl}${pathname}`;
}

function buildAlternates(
  enPath: string | null,
  arPath: string | null
): MetadataRoute.Sitemap[number]['alternates'] | undefined {
  const languages: Record<string, string> = {};
  if (enPath) {
    languages.en = toAbsolute(enPath);
    languages['x-default'] = toAbsolute(enPath);
  }
  if (arPath) {
    languages.ar = toAbsolute(arPath);
    if (!languages['x-default']) {
      languages['x-default'] = toAbsolute(arPath);
    }
  }
  return Object.keys(languages).length ? { languages } : undefined;
}

function getLatestMtime(paths: string[]): string {
  let latest: number | null = null;
  for (const file of paths) {
    try {
      const stats = fs.statSync(file);
      const mtime = stats.mtime.getTime();
      if (!Number.isNaN(mtime)) {
        latest = latest ? Math.max(latest, mtime) : mtime;
      }
    } catch {
      // ignore missing files
    }
  }
  return latest ? new Date(latest).toISOString() : nowIso;
}

function findTimelineFile(id: string): string | null {
  const candidates = [timelineDataDir, timelineContentDir];
  for (const dir of candidates) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      if (!file.endsWith('.yml') && !file.endsWith('.yaml')) continue;
      if (file.endsWith(`${id}.yml`) || file.endsWith(`${id}.yaml`)) {
        return path.join(dir, file);
      }
    }
  }
  return null;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  const staticRoutes: Array<{ en: string; ar?: string | null }> = [
    { en: '/', ar: '/ar' },
    { en: '/timeline', ar: '/ar/timeline' },
    { en: '/map', ar: '/ar/map' },
    { en: '/learn', ar: '/ar/learn' },
    { en: '/chapters' },
    { en: '/submit', ar: '/ar/submit' },
  ];

  for (const route of staticRoutes) {
    const lastModified = getLatestMtime([]);
    const alternates = buildAlternates(route.en, route.ar ?? null);
    urls.push({
      url: toAbsolute(route.en),
      lastModified,
      ...(alternates ? { alternates } : {}),
    });
  }

  const lessonSlugs = loadLessonSlugs().sort();
  for (const slug of lessonSlugs) {
    const frontmatter = loadLessonFrontmatter(slug);
    const lastModified = getLatestMtime([frontmatter._file]);
    const enPath = `/learn/${slug}`;
    urls.push({
      url: toAbsolute(enPath),
      lastModified,
      alternates: {
        languages: {
          en: toAbsolute(enPath),
          'x-default': toAbsolute(enPath),
        },
      },
    });
  }

  const chapterSlugs = Array.from(new Set(loadChapterSlugsAr())).sort();
  for (const slug of chapterSlugs) {
    const enExists = hasEnChapter(slug);
    const arExists = hasArChapter(slug);
    const enPath = enExists ? `/chapters/${slug}` : null;
    const arPath = arExists ? `/ar/chapters/${slug}` : null;

    if (!enPath && !arPath) {
      continue;
    }

    const files: string[] = [];
    if (enExists) {
      const frontmatter = loadChapterFrontmatter(slug);
      files.push(frontmatter._file);
    }
    if (arExists) {
      files.push(path.join(chaptersDir, `${slug}.ar.mdx`));
    }

    const lastModified = getLatestMtime(files);
    const canonical = enPath ?? arPath!;
    const alternates = buildAlternates(enPath, arPath);

    urls.push({
      url: toAbsolute(canonical),
      lastModified,
      ...(alternates ? { alternates } : {}),
    });
  }

  const events = loadTimelineEvents();
  for (const event of events) {
    const enPath = `/timeline/${event.id}`;
    const arPath = `/ar/timeline/${event.id}`;
    const file = findTimelineFile(event.id);
    const lastModified = file ? getLatestMtime([file]) : nowIso;
    const alternates = buildAlternates(enPath, arPath);

    urls.push({
      url: toAbsolute(enPath),
      lastModified,
      ...(alternates ? { alternates } : {}),
    });
  }

  try {
    const places = loadGazetteer();
    const gazetteerMtime = getLatestMtime([gazetteerFile]);
    for (const place of places) {
      const enPath = `/places/${place.id}`;
      const arPath = `/ar/places/${place.id}`;
      const alternates = buildAlternates(enPath, arPath);
      urls.push({
        url: toAbsolute(enPath),
        lastModified: gazetteerMtime,
        ...(alternates ? { alternates } : {}),
      });
    }
  } catch {
    // ignore missing gazetteer in certain builds
  }

  return urls;
}
