import fs from 'node:fs';
import path from 'node:path';
import type { CSL } from '@/lib/types';

let _cache: Record<string, CSL> | null = null;

function loadAll(): Record<string, CSL> {
  if (_cache) return _cache;
  const p = path.join(process.cwd(), 'data', 'bibliography.json');
  const arr = JSON.parse(fs.readFileSync(p, 'utf8')) as CSL[];
  _cache = Object.fromEntries(arr.map((e) => [e.id, e]));
  return _cache!;
}

export function citeById(id: string): string {
  const db = loadAll();
  const ref = db[id];
  if (!ref) return `[missing: ${id}]`;
  const parts: string[] = [];
  if (ref.author?.length) {
    const first = ref.author[0];
    parts.push(`${first.family}${first.given ? `, ${first.given}` : ''} et al.`);
  }
  if (ref.title) parts.push(`“${ref.title}”`);
  if (ref.author?.length || ref.title) parts.push('—');
  if (ref.authority) parts.push(ref.authority);
  if (ref.publisher) parts.push(ref.publisher);
  if (ref['publisher-place']) parts.push(ref['publisher-place']);
  if (ref.issued?.['date-parts']?.[0]?.[0]) parts.push(String(ref.issued['date-parts'][0][0]));
  if (ref.URL) parts.push(ref.URL);
  return parts.filter(Boolean).join(' ');
}

export function formatSources(sources: Array<{ id?: string; url?: string }>): string[] {
  return sources.map((s) => {
    if (s.id) return citeById(s.id);
    if (s.url) return s.url;
    return '[unrecognized source]';
  });
}
