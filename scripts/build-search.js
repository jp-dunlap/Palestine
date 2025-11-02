import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import YAML from 'yaml';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const CHAPTERS_DIR = path.join(ROOT, 'content', 'chapters');
const DATA_TIMELINE_DIR = path.join(ROOT, 'data', 'timeline');
const CONTENT_TIMELINE_DIR = path.join(ROOT, 'content', 'timeline');

function normaliseTags(value) {
  if (!Array.isArray(value)) return [];
  return value.map((tag) => String(tag));
}

function hasArabic(str) {
  return typeof str === 'string' && /[\u0600-\u06FF]/.test(str);
}

async function loadChapterDocs() {
  if (!(await exists(CHAPTERS_DIR))) return [];
  const entries = await fs.readdir(CHAPTERS_DIR);
  const docs = [];

  for (const file of entries) {
    if (!file.endsWith('.mdx') || file.endsWith('.ar.mdx')) continue;
    const baseSlug = file.replace(/\.mdx$/, '');
    const full = path.join(CHAPTERS_DIR, file);
    const raw = await fs.readFile(full, 'utf8');
    const { data } = matter(raw);
    const tags = normaliseTags(data.tags);

    docs.push({
      title: String(data.title ?? baseSlug),
      summary: String(data.summary ?? ''),
      tags,
      href: `/chapters/${baseSlug}`,
      lang: 'en',
    });

    const arFile = path.join(CHAPTERS_DIR, `${baseSlug}.ar.mdx`);
    let arData = null;
    if (await exists(arFile)) {
      const rawAr = await fs.readFile(arFile, 'utf8');
      const parsed = matter(rawAr);
      arData = parsed.data || null;
    }

    const titleAr = arData?.title ?? data.title_ar;
    const summaryAr = arData?.summary ?? data.summary_ar;
    const tagsAr = arData?.tags ?? data.tags_ar;

    if (hasArabic(titleAr)) {
      docs.push({
        title: String(titleAr),
        summary: hasArabic(summaryAr) ? String(summaryAr) : '',
        tags: normaliseTags(tagsAr),
        href: `/ar/chapters/${baseSlug}`,
        lang: 'ar',
      });
    }
  }

  return docs;
}

function parseTimelineDir(dir) {
  return fs
    .readdir(dir)
    .then((files) => files.filter((file) => file.endsWith('.yml')))
    .catch(() => []);
}

async function loadTimelineDocs() {
  const dirs = [DATA_TIMELINE_DIR, CONTENT_TIMELINE_DIR];
  const seen = new Map();
  const docs = [];

  for (const dir of dirs) {
    if (!(await exists(dir))) continue;
    const files = await parseTimelineDir(dir);
    for (const file of files) {
      const full = path.join(dir, file);
      const raw = await fs.readFile(full, 'utf8');
      const data = YAML.parse(raw) || {};
      const id = data.id ? String(data.id) : null;
      if (!id || seen.has(id)) continue;
      seen.set(id, true);

      const english = {
        title: String(data.title ?? id),
        summary: String(data.summary ?? ''),
        tags: normaliseTags(data.tags),
        href: `/timeline#${id}`,
        lang: 'en',
      };
      docs.push(english);

      const titleAr = data.title_ar;
      const summaryAr = data.summary_ar;
      const tagsAr = data.tags_ar;
      if (hasArabic(titleAr) || hasArabic(summaryAr) || (Array.isArray(tagsAr) && tagsAr.some(hasArabic))) {
        docs.push({
          title: String(titleAr || data.title || id),
          summary: hasArabic(summaryAr) ? String(summaryAr) : '',
          tags: normaliseTags(tagsAr),
          href: `/ar/timeline#${id}`,
          lang: 'ar',
        });
      }
    }
  }

  return docs;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const [chapters, timeline] = await Promise.all([loadChapterDocs(), loadTimelineDocs()]);
  const docs = [...chapters, ...timeline];
  const byLang = { en: [], ar: [] };
  for (const doc of docs) {
    if (doc.lang === 'en' || doc.lang === 'ar') {
      const { lang, ...rest } = doc;
      byLang[doc.lang].push(rest);
    }
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  for (const lang of ['en', 'ar']) {
    const outPath = path.join(PUBLIC_DIR, `search.${lang}.json`);
    const payload = `${JSON.stringify(byLang[lang], null, 2)}\n`;
    await fs.writeFile(outPath, payload, 'utf8');
    console.log(`[search] wrote ${byLang[lang].length} docs to ${path.relative(ROOT, outPath)}`);
  }
}

await main().catch((err) => {
  console.error('[search] failed:', err);
  process.exit(1);
});
