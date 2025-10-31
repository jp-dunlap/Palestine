import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { Era, TimelineEvent } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMELINE_DIR = path.join(DATA_DIR, 'timeline');

function toYearNumber(v: unknown): number | null {
  if (v === null || typeof v === 'undefined' || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const s = v.trim();
    const m = s.match(/^(-?\d{1,4})/); // take leading year, supports BCE (e.g., "-1200") or "1917-11-02"
    if (m) return Number(m[1]);
  }
  throw new Error(`Invalid year value: ${JSON.stringify(v)}`);
}

function requireYearNumber(v: unknown, ctx: string): number {
  const n = toYearNumber(v);
  if (n === null) throw new Error(`Missing required year for ${ctx}`);
  return n;
}

export function loadEras(): Era[] {
  const p = path.join(DATA_DIR, 'eras.yml');
  const raw = fs.readFileSync(p, 'utf8');
  const arr = YAML.parse(raw) as any[];

  return (arr || []).filter(Boolean).map((e: any) => {
    const start = requireYearNumber(e.start, `era ${e.id} start`);
    const end = toYearNumber(e.end);

    if (end !== null && start > end) {
      throw new Error(`Era ${e.id} has start > end (${start} > ${end})`);
    }

    return {
      id: String(e.id),
      title: String(e.title ?? e.label ?? e.id),
      start,
      end, // number or null
      color: typeof e.color === 'string' ? e.color : undefined,
    } as Era;
  });
}

export function loadTimelineEvents(): TimelineEvent[] {
  const files = fs.readdirSync(TIMELINE_DIR).filter((f) => f.endsWith('.yml'));
  const events: TimelineEvent[] = [];

  for (const f of files) {
    const raw = fs.readFileSync(path.join(TIMELINE_DIR, f), 'utf8');
    const d = YAML.parse(raw) as any;

    const start = requireYearNumber(d.start, `event ${d.id} start`);
    const end = toYearNumber(d.end);

    if (end !== null && start > end) {
      throw new Error(`Invalid range in ${f}: start > end`);
    }

    const evt: TimelineEvent = {
      id: String(d.id),
      title: String(d.title),
      start,                      // number (year)
      end,                        // number | null
      places: Array.isArray(d.places) ? d.places.map(String) : [],
      sources: Array.isArray(d.sources) ? d.sources.map(String) : [],
      summary: String(d.summary ?? ''), // required string in types
      tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
      certainty: (['low', 'medium', 'high'].includes(d.certainty)
        ? d.certainty
        : 'medium') as 'low' | 'medium' | 'high',
      era: d.era ? String(d.era) : undefined,
    };

    events.push(evt);
  }

  // sort chronologically, then by title
  events.sort((a, b) => (a.start - b.start) || a.title.localeCompare(b.title));
  return events;
}

export function filterTimeline(params: {
  q?: string;
  eras?: string[];
  tags?: string[];
  places?: string[];
}): TimelineEvent[] {
  const q = (params.q ?? '').toLowerCase();
  const wantEras = new Set((params.eras ?? []).map(String));
  const wantTags = new Set((params.tags ?? []).map(String));
  const wantPlaces = new Set((params.places ?? []).map(String));

  return loadTimelineEvents().filter((e) => {
    if (q) {
      const hay = [e.title, e.summary, ...(e.tags ?? []), ...(e.places ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (wantEras.size && (!e.era || !wantEras.has(e.era))) return false;
    if (wantTags.size && !(e.tags ?? []).some((t) => wantTags.has(t))) return false;
    if (wantPlaces.size && !(e.places ?? []).some((p) => wantPlaces.has(p))) return false;
    return true;
  });
}
