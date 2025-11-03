import { describe, expect, it } from 'vitest';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();

function resolve(...segments: string[]) {
  return path.join(ROOT, ...segments);
}

describe('search index regeneration', () => {
  it('captures updated chapter summaries in the search index', async () => {
    const chapterPath = resolve('content', 'chapters', '001-prologue.mdx');
    const indexPath = resolve('public', 'search.en.json');

    const [chapterRaw, indexRaw] = await Promise.all([
      fs.readFile(chapterPath, 'utf8'),
      fs.readFile(indexPath, 'utf8'),
    ]);

    const { data } = matter(chapterRaw);
    const docs = JSON.parse(indexRaw) as Array<Record<string, unknown>>;
    const entry = docs.find((doc) => doc && doc.href === '/chapters/001-prologue');

    expect(entry).toBeTruthy();
    expect(entry?.summary).toBe(data.summary);
  });
});
