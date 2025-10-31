cat > lib/bibliography.ts <<'TS'
// lib/bibliography.ts
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

/** Full, human-readable citation string */
export function citeById(id: string): string {
  const db = loadAll();
  const ref = db[id];
  if (!ref) return `[missing: ${id}]`;
  const parts: string[] = [];

  if (ref.author?.length) {
    const first = ref.author[0];
    const hasEtAl = ref.author.length > 1;
    parts.push(`${first.family}${first.given ? `, ${first.given}` : ''}${hasEtAl ? ' et al.' : ''}`);
  }

  if (ref.title) parts.push(`“${ref.title}”`);
  if (ref.author?.length || ref.title) parts.push('—');
  if (ref.authority) parts.push(ref.authority);
  if (ref.publisher) parts.push(ref.publisher);
  if ((ref as any)['publisher-place']) parts.push((ref as any)['publisher-place']);
  const year = ref.issued?.['date-parts']?.[0]?.[0];
  if (year) parts.push(String(year));
  if ((ref as any).URL) parts.push((ref as any).URL);

  return parts.filter(Boolean).join(' ');
}

/** Short inline label for superscripts: "Family YEAR" or "Authority YEAR" */
export function shortCiteById(id: string): string {
  const db = loadAll();
  const ref = db[id];
  if (!ref) return id;
  const year = ref.issued?.['date-parts']?.[0]?.[0];
  const who =
    (ref.author?.[0]?.family) ||
    ref.authority ||
    (ref.publisher ? ref.publisher : '');
  return [who, year].filter(Boolean).join(' ');
}

export function formatSources(sources: Array<{ id?: string; url?: string }>): string[] {
  return sources.map((s) => {
    if (s.id) return citeById(s.id);
    if (s.url) return s.url;
    return '[unrecognized source]';
  });
}
TS
