// app/sitemap.ts
import fs from 'node:fs';
import path from 'node:path';
import type { MetadataRoute } from 'next';
import { loadChapterFrontmatter, loadChapterSlugsAr, hasArChapter, hasEnChapter } from '@/lib/loaders.chapters';
import { loadLessonFrontmatter, loadLessonSlugs } from '@/lib/loaders.lessons';
import { loadGazetteer } from '@/lib/loaders.places';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

function buildLanguageAlternates(enUrl: string, arUrl: string) {
  return {
    languages: {
      en: enUrl,
      ar: arUrl,
      'x-default': enUrl,
    },
  } satisfies NonNullable<MetadataRoute.Sitemap[number]['alternates']>;
}

function getFileMtimeIso(filePath: string): string {
  try {
    const stats = fs.statSync(filePath);
    return stats.mtime.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  const now = new Date().toISOString();

  const urls: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, alternates: buildLanguageAlternates(`${base}/`, `${base}/ar`) },
    { url: `${base}/map`, lastModified: now, alternates: buildLanguageAlternates(`${base}/map`, `${base}/ar/map`) },
    { url: `${base}/timeline`, lastModified: now, alternates: buildLanguageAlternates(`${base}/timeline`, `${base}/ar/timeline`) },
    { url: `${base}/learn`, lastModified: now, alternates: buildLanguageAlternates(`${base}/learn`, `${base}/ar/learn`) },
    { url: `${base}/ar`, lastModified: now, alternates: buildLanguageAlternates(`${base}/`, `${base}/ar`) },
    { url: `${base}/ar/map`, lastModified: now, alternates: buildLanguageAlternates(`${base}/map`, `${base}/ar/map`) },
    { url: `${base}/ar/timeline`, lastModified: now, alternates: buildLanguageAlternates(`${base}/timeline`, `${base}/ar/timeline`) },
    { url: `${base}/ar/learn`, lastModified: now, alternates: buildLanguageAlternates(`${base}/learn`, `${base}/ar/learn`) },
  ];

  const lessonSlugs = loadLessonSlugs().sort();
  for (const slug of lessonSlugs) {
    const { _file } = loadLessonFrontmatter(slug);
    const lastModified = getFileMtimeIso(_file);
    const enUrl = `${base}/learn/${slug}`;

    urls.push({
      url: enUrl,
      lastModified,
      alternates: {
        languages: {
          en: enUrl,
          'x-default': enUrl,
        },
      },
    });
  }

  const chapterSlugs = Array.from(new Set(loadChapterSlugsAr())).sort();
  for (const slug of chapterSlugs) {
    const enUrl = `${base}/chapters/${slug}`;
    const arUrl = `${base}/ar/chapters/${slug}`;

    if (hasEnChapter(slug)) {
      const { _file } = loadChapterFrontmatter(slug);
      const lastModified = getFileMtimeIso(_file);
      urls.push({
        url: enUrl,
        lastModified,
        alternates: buildLanguageAlternates(enUrl, arUrl),
      });
    }

    if (hasArChapter(slug)) {
      const arFile = path.join(process.cwd(), 'content', 'chapters', `${slug}.ar.mdx`);
      const lastModified = getFileMtimeIso(arFile);
      urls.push({
        url: arUrl,
        lastModified,
        alternates: buildLanguageAlternates(enUrl, arUrl),
      });
    }
  }

  const timelineEvents = loadTimelineEvents();
  for (const event of timelineEvents) {
    const enUrl = `${base}/timeline/${event.id}`;
    const arUrl = `${base}/ar/timeline/${event.id}`;
    const alternates = buildLanguageAlternates(enUrl, arUrl);
    urls.push({ url: enUrl, lastModified: now, alternates });
    urls.push({ url: arUrl, lastModified: now, alternates });
  }

  // Places (EN + AR paths)
  try {
    const places = loadGazetteer();
    for (const p of places) {
      urls.push({
        url: `${base}/places/${p.id}`,
        lastModified: now,
        alternates: buildLanguageAlternates(`${base}/places/${p.id}`, `${base}/ar/places/${p.id}`),
      });
      urls.push({
        url: `${base}/ar/places/${p.id}`,
        lastModified: now,
        alternates: buildLanguageAlternates(`${base}/places/${p.id}`, `${base}/ar/places/${p.id}`),
      });
    }
  } catch {
    // if gazetteer missing in some preview builds, just return base routes
  }

  return urls;
}
