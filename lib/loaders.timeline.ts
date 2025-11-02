// lib/loaders.timeline.ts
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import type { Era, TimelineEvent } from '@/lib/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const TIMELINE_DIR = path.join(DATA_DIR, 'timeline');
const CONTENT_TIMELINE_DIR = path.join(process.cwd(), 'content', 'timeline');

export function toYearNumber(v: unknown): number | null {
  if (v === null || typeof v === 'undefined' || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const m = v.trim().match(/^(-?\d{1,4})/);
    if (m) return Number(m[1]);
  }
  throw new Error(`Invalid year value: ${JSON.stringify(v)}`);
}
export function requireYearNumber(v: unknown, ctx: string): number {
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
      const title = String(e.title ?? e.label ?? e.id);
      const titleArRaw = e.title_ar ?? e.label_ar;
      const era: Era = {
        id: String(e.id),
        title,
        start,
        end: endMaybe ?? null,
        ...(typeof e.color === 'string' ? { color: e.color } : {}),
      };
      if (typeof titleArRaw === 'string' && titleArRaw.trim()) {
        era.title_ar = titleArRaw.trim();
      }
      eras.push({
        ...era,
      });
    } catch (err) {
      console.error('[eras] skip invalid entry', e?.id ?? '(no id)', String(err));
    }
  }
  eras.sort((a, b) => (a.start - b.start) || a.title.localeCompare(b.title));
  return eras;
}

function readTimelineDir(dir: string, seen: Map<string, TimelineEvent>) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yml'));

  for (const f of files) {
    const full = path.join(dir, f);
    try {
      const d = readYamlObject(full);

      const id = d.id != null ? String(d.id) : null;
      if (!id) throw new Error('Missing id');

      if (seen.has(id)) {
        continue;
      }

      const start = requireYearNumber(d.start, `event ${id} start`);
      const endMaybe = toYearNumber(d.end);
      if (endMaybe !== null && start > endMaybe) {
        throw new Error(`start > end (${start} > ${endMaybe})`);
      }

      const event: TimelineEvent = {
        id,
        title: String(d.title ?? id),
        ...(typeof d.title_ar === 'string' && d.title_ar.trim() ? { title_ar: d.title_ar.trim() } : {}),
        start,
        end: endMaybe, // number | null
        places: Array.isArray(d.places) ? d.places.map(String) : [],
        sources: Array.isArray(d.sources) ? d.sources.map(String) : [],
        summary: d.summary ? String(d.summary) : '',
        ...(typeof d.summary_ar === 'string' && d.summary_ar.trim()
          ? { summary_ar: d.summary_ar.trim() }
          : {}),
        tags: Array.isArray(d.tags) ? d.tags.map(String) : [],
        ...(Array.isArray(d.tags_ar) && d.tags_ar.length
          ? { tags_ar: d.tags_ar.map(String) }
          : {}),
        certainty: (['low', 'medium', 'high'].includes(d.certainty as any)
          ? (d.certainty as 'low' | 'medium' | 'high')
          : 'medium'),
        era: d.era ? String(d.era) : undefined,
      };

      seen.set(id, event);
    } catch (err) {
      console.error('[timeline] skip', path.basename(full), '→', String(err));
      continue;
    }
  }
}

export function loadTimelineEvents(): TimelineEvent[] {
  const map = new Map<string, TimelineEvent>();
  readTimelineDir(TIMELINE_DIR, map);
  readTimelineDir(CONTENT_TIMELINE_DIR, map);

  const events = Array.from(map.values());
  events.sort((a, b) => (a.start - b.start) || a.title.localeCompare(b.title));
  return events;
}

type FilterParams = {
  q?: string;
  eras?: string[];
  tags?: string[];
  places?: string[];
  locale?: 'en' | 'ar';
};

function localiseEvent(event: TimelineEvent, locale: 'en' | 'ar'): TimelineEvent {
  if (locale !== 'ar') {
    return { ...event, tags: [...(event.tags ?? [])] };
  }

  const tagsAr = event.tags_ar && event.tags_ar.length ? event.tags_ar : event.tags;
  return {
    ...event,
    title: event.title_ar?.trim() || event.title,
    summary: event.summary_ar?.trim() || event.summary,
    tags: [...(tagsAr ?? [])],
  };
}

export function filterTimeline(params: FilterParams): TimelineEvent[] {
  const locale = params.locale ?? 'en';
  const q = (params.q ?? '').toLowerCase();
  const wantEras = new Set((params.eras ?? []).map(String));
  const wantTags = new Set((params.tags ?? []).map(String));
  const wantPlaces = new Set((params.places ?? []).map(String));

  return loadTimelineEvents().map((event) => localiseEvent(event, locale)).filter((e) => {
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

export function getTimelineEventById(
  id: string,
  opts?: { locale?: 'en' | 'ar' }
): TimelineEvent | null {
  const locale = opts?.locale ?? 'en';
  const event = loadTimelineEvents().find((e) => e.id === id);
  if (!event) return null;
  return localiseEvent(event, locale);
}

export function getRelatedTimelineEvents(
  event: TimelineEvent,
  opts?: { limit?: number; locale?: 'en' | 'ar' }
): TimelineEvent[] {
  const locale = opts?.locale ?? 'en';
  const limit = Math.max(0, opts?.limit ?? 4);
  if (!limit) return [];

  const sourceTags = new Set((event.tags ?? []).map(String));
  const sourcePlaces = new Set((event.places ?? []).map(String));

  const candidates = loadTimelineEvents()
    .filter((candidate) => candidate.id !== event.id)
    .map((candidate) => {
      let score = 0;
      const sharedTags = (candidate.tags ?? []).filter((tag) => sourceTags.has(tag)).length;
      const sharedPlaces = (candidate.places ?? []).filter((place) => sourcePlaces.has(place)).length;
      if (event.era && candidate.era && event.era === candidate.era) {
        score += 1;
      }
      score += sharedTags * 2 + sharedPlaces * 3;
      return { candidate, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const diff = a.candidate.start - b.candidate.start;
      if (diff !== 0) return diff;
      return a.candidate.title.localeCompare(b.candidate.title, locale);
    })
    .slice(0, limit)
    .map((entry) => localiseEvent(entry.candidate, locale));

  return candidates;
}
