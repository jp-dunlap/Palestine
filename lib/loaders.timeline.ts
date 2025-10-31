// lib/loaders.timeline.ts
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
    const m = v.trim().match(/^(-?\d{1,4})/);
    if (m) return Number(m[1]);
  }
  throw new Error(`Invalid year value: ${JSON.stringify(v)}`);
}
function requireYearNumber(v: unknown, ctx: string): number {
  const n = toYearNumber(v);
  if (n === null) throw new Error(`Missing required year for ${ctx}`);
  return n;
}
function readYamlObject(filePath: string): Record<string, unknown> {
  const raw = fs.readFileSync(filePath, 'utf8');
  const doc = YAML.parse(raw);
  if (doc === null || typeof doc !== 'object' || Array.isArray(doc)) {
    throw new Error(`Expected a YAML object in ${path.relative(process.cwd(), filePath)}`);
  }
  return doc as Record<string, unknown>;
}

export function loadEras(): Era[] {
  const p = path.join(DATA_DIR, 'eras.yml');
  const raw = fs.readFileSync(p, 'utf8');
  const arr = (YAML.parse(raw) as any[]) || [];

  const eras: Era[] = [];
  for (const e of arr) {
    if (!e) continue;
    try {
      const start = requireYearNumber(e.start, `era ${e.id ?? '(no id)'} start`);
      const endMaybe = toYearNumber(e.end);
      if (endMaybe !== null && start > endMaybe) {
        throw new Error(`Era ${e.id} has start > end (${start} > ${endMaybe})`);
      }
      eras.push({
        id: String(e.id),
        title: String(e.title ?? e.label ?? e.id),
        start,
        ...(endMaybe !== null ? { end: endMaybe } : {}),
        ...(typeof e.color === 'string' ? { color: e.color } : {}),
      } as Era);
    } catch (err) {
      console.error('[eras] skip invalid entry', e?.id ?? '(no id)', String(err));
    }
  }
  eras.sort((a, b) => (a.start - b.start) || a.title.localeCompare(b.title));
  return eras;
}

export function loadTimelineEvents(): TimelineEvent[] {
  if (!fs.existsSync(TIMELINE_DIR)) return [];
  const files = fs.readdirSync(TIMELINE_DIR).filter((f) => f.endsWith('.yml'));
  const events: TimelineEvent[] = [];

  for (const f of files) {
    const full = path.join(TIMELINE_DIR, f);
    try {
      const d = readYamlObject(full);

      const id = d.id != null ? String(d.id) : null;
      if (!id) throw new Error('Missing id');

      const start = requireYearNumber(d.start, `event ${id} start`);
      const endMaybe = toYearNumber(d.end);
      if (endMaybe !== null && start > endMaybe) {
        throw new Error(`start > end (${start} > ${endMaybe})`);
      }

      events.push({
        id,
        title: String(d.title ?? id),
        start,
        end: endMaybe, // number | null
        places: Array.isArray(d.places) ? d.places.map(String) : [],
        sources: Array.isArray(d.sources) ? d.sources.map(String) : [],
        summary: d.summary ? String(d.summary) : '',
        tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
        certainty: (['low', 'medium', 'high'].includes(d.certainty as any)
          ? (d.certainty as 'low' | 'medium' | 'high')
          : 'medium'),
        era: d.era ? String(d.era) : undefined,
      });
    } catch (err) {
      console.error('[timeline] skip', path.basename(full), '→', String(err));
      continue;
    }
  }

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
