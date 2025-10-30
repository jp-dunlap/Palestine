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

