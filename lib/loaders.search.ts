import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { loadTimeline } from '@/lib/loaders';

export type SearchDoc = {
  id: string;
  kind: 'chapter' | 'timeline' | 'place';
  title: string;
  slug?: string;
  summary?: string;
  tags?: string[];
};

export function loadSearchDocs(): SearchDoc[] {
  const docs: SearchDoc[] = [];

  // Chapters (MDX)
  const chDir = path.join(process.cwd(), 'content', 'chapters');
  for (const file of fs.readdirSync(chDir).filter(f => f.endsWith('.mdx'))) {
    const slug = file.replace(/\.mdx$/, '');
    const raw = fs.readFileSync(path.join(chDir, file), 'utf8');
    const { data } = matter(raw);
    docs.push({
      id: `chapter:${slug}`,
      kind: 'chapter',
      title: String(data.title ?? slug),
      slug,
      summary: data.summary ?? '',
      tags: data.tags ?? []
    });
  }

  // Timeline (YAML)
  for (const ev of loadTimeline()) {
    docs.push({
      id: `timeline:${ev.id}`,
      kind: 'timeline',
      title: ev.title,
      summary: ev.summary,
      tags: ev.tags
    });
  }

  return docs;
}
