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
  const dir = fs.readdirSync(path.join(process.cwd(), 'content', 'chapters'));
  return dir.filter(f => f.endsWith('.ar.mdx')).map(f => f.replace(/\.ar\.mdx$/, ''));
}
export function loadChapterSourceAr(slug: string): string {
  const file = path.join(process.cwd(), 'content', 'chapters', `${slug}.ar.mdx`);
  return fs.readFileSync(file, 'utf8');
}
// --- language helpers ---
export function hasArChapter(slug: string): boolean {
  const fs = require('node:fs');
  const path = require('node:path');
  return fs.existsSync(path.join(process.cwd(), 'content', 'chapters', `${slug}.ar.mdx`));
}

export function hasEnChapter(slug: string): boolean {
  const fs = require('node:fs');
  const path = require('node:path');
  return fs.existsSync(path.join(process.cwd(), 'content', 'chapters', `${slug}.mdx`));
}
