import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { LessonFrontmatter } from '@/lib/types';

const LESSONS_DIR = path.join(process.cwd(), 'content', 'lessons');

export function loadLessonSlugs(): string[] {
  if (!fs.existsSync(LESSONS_DIR)) return [];
  return fs
    .readdirSync(LESSONS_DIR)
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => file.replace(/\.mdx$/, ''));
}

export function loadLessonFrontmatter(slug: string): LessonFrontmatter & { _file: string } {
  const file = path.join(LESSONS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing lesson for slug "${slug}"`);
  }
  const raw = fs.readFileSync(file, 'utf8');
  const { data } = matter(raw);
  const frontmatter = data as LessonFrontmatter;
  return { ...frontmatter, _file: file };
}

export function loadLessonSource(slug: string): string {
  const file = path.join(LESSONS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing lesson for slug "${slug}"`);
  }
  return fs.readFileSync(file, 'utf8');
}
