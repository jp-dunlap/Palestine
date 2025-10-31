import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { Era, TimelineEvent } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMELINE_DIR = path.join(DATA_DIR, 'timeline');

function parseDate(s?: string | null): string | null {
  if (!s) return null;
  return String(s).trim();
}

export function loadEras(): Era[] {
  const p = path.join(DATA_DIR, 'eras.yml');
  const raw = fs.readFileSync(p, 'utf8');
  const arr = YAML.parse(raw) as any[];
  return arr.map((e) => ({
    id: String(e.id),
    title: String(e.title),
    start: String(e.start),
    end: e.end == null ? undefined : String(e.end),
  }));
}

export function loadTimelineEvents(): TimelineEvent[] {
  const files = fs.readdirSync(TIMELINE_DIR).filter((f) => f.endsWith('.yml'));
  const events: TimelineEvent[] = [];

  for (const f of files) {
    const raw = fs.readFileSync(path.join(TIMELINE_DIR, f), 'utf8');
    const d = YAML.parse(raw) as any;

    const start = parseDate(d.start);
    const end = parseDate(d.end);

    if (start && end && start > end) {
      throw new Error(`Invalid range in ${f}: start > end`);
    }

    events.push({
      id: String(d.id),
      title: String(d.title),
      start: start!,
      end: end ?? undefined,
      places: (d.places ?? []).map(String),
      sources: (d.sources ?? []).map(String),
      summary: d.summary ? String(d.summary) : undefined,
      tags: (d.tags ?? []).map(String),
      certainty: d.certainty ? String(d.certainty) : undefined,
      era: d.era ? String(d.era) : undefined,
    } as TimelineEvent);
  }

  // chronological ordering
  events.sort((a, b) => String(a.start).localeCompare(String(b.start)));
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

