import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ChapterFrontmatter } from '@/lib/types';

const CH_DIR = path.join(process.cwd(), 'content', 'chapters');

export function loadChapterSlugs(): string[] {
  return fs
    .readdirSync(CH_DIR)
    .filter(f => f.endsWith('.mdx'))
    .map(f => f.replace(/\.mdx$/, ''));
}

export function loadChapterFrontmatter(slug: string): ChapterFrontmatter & { _file: string } {
  const file = path.join(CH_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = matter(raw);
  const fm = data as ChapterFrontmatter;
  return { ...fm, _file: file };
}

export function loadChapterSource(slug: string): string {
  const file = path.join(process.cwd(), 'content', 'chapters', `${slug}.mdx`);
  return fs.readFileSync(file, 'utf8');
}
// --- Arabic variants ---
// Files are named like 001-prologue.ar.mdx

export function loadChapterSlugsAr(): string[] {
  const dir = fs.readdirSync(CH_DIR);
  const arSlugs = dir
    .filter(f => f.endsWith('.ar.mdx'))
    .map(f => f.replace(/\.ar\.mdx$/, ''));
  const all = new Set<string>(loadChapterSlugs());
  for (const slug of arSlugs) all.add(slug);
  return Array.from(all);
}
export function loadChapterSourceAr(slug: string): { source: string; isFallback: boolean } {
  const arFile = path.join(CH_DIR, `${slug}.ar.mdx`);
  if (fs.existsSync(arFile)) {
    return { source: fs.readFileSync(arFile, 'utf8'), isFallback: false };
  }

  const enFile = path.join(CH_DIR, `${slug}.mdx`);
  if (fs.existsSync(enFile)) {
    return { source: fs.readFileSync(enFile, 'utf8'), isFallback: true };
  }

  throw new Error(`Missing chapter for slug "${slug}"`);
}
export function loadChapterFrontmatterAr(slug: string): { frontmatter: ChapterFrontmatter; isFallback: boolean } {
  const arFile = path.join(CH_DIR, `${slug}.ar.mdx`);
  if (fs.existsSync(arFile)) {
    const raw = fs.readFileSync(arFile, 'utf8');
    const { data } = matter(raw);
    return { frontmatter: data as ChapterFrontmatter, isFallback: false };
  }

  const enFile = path.join(CH_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(enFile, 'utf8');
  const { data } = matter(raw);
  return { frontmatter: data as ChapterFrontmatter, isFallback: true };
}
// --- language helpers ---
export function hasArChapter(slug: string): boolean {
  return fs.existsSync(path.join(CH_DIR, `${slug}.ar.mdx`));
}

export function hasEnChapter(slug: string): boolean {
  return fs.existsSync(path.join(CH_DIR, `${slug}.mdx`));
}
