import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { loadTimelineEvents as baseLoadTimelineEvents } from '@/lib/loaders.timeline';

export type Era = {
  id: string;
  title: string;
  title_ar?: string;
  start?: number;
  end?: number;
};

export type TimelineEvent = {
  id: string;
  era?: string;
  title?: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  tags?: string[];
  tags_ar?: string[];
  places?: string[];
  start?: { year?: number; month?: number; day?: number };
  end?: { year?: number; month?: number; day?: number };
};

const ROOT = process.cwd();
const ERAS_FILE = path.join(ROOT, 'data', 'eras.yml');

export function loadEras(): Era[] {
  const raw = fs.readFileSync(ERAS_FILE, 'utf8');
  const data = YAML.parse(raw);
  if (!Array.isArray(data)) return [];
  return data.map((e: any) => ({
    id: String(e.id ?? ''),
    title: String(e.title ?? ''),
    title_ar: e.title_ar ? String(e.title_ar) : undefined,
    start: typeof e.start === 'number' ? e.start : undefined,
    end: typeof e.end === 'number' ? e.end : undefined,
  }));
}

export function loadTimelineEvents(): TimelineEvent[] {
  return baseLoadTimelineEvents() as TimelineEvent[];
}

export function filterTimeline(
  events: TimelineEvent[],
  opts: {
    q?: string;
    eras?: string[];
    tags?: string[];
    place?: string;
    locale?: 'en' | 'ar';
  } = {}
): TimelineEvent[] {
  const q = (opts.q ?? '').trim().toLowerCase();
  const eraSet = new Set((opts.eras ?? []).map(s => s.toLowerCase()));
  const tagSet = new Set((opts.tags ?? []).map(s => s.toLowerCase()));
  const place = (opts.place ?? '').toLowerCase();
  const isAr = opts.locale === 'ar';

  const matches = (ev: TimelineEvent) => {
    if (eraSet.size && (!ev.era || !eraSet.has(String(ev.era).toLowerCase()))) return false;

    const evTags = isAr ? (ev.tags_ar ?? ev.tags ?? []) : (ev.tags ?? []);
    if (tagSet.size) {
      const lower = (evTags ?? []).map(t => String(t).toLowerCase());
      const ok = [...tagSet].every(t => lower.includes(t));
      if (!ok) return false;
    }

    if (place) {
      const lowerPlaces = (ev.places ?? []).map(p => String(p).toLowerCase());
      if (!lowerPlaces.includes(place)) return false;
    }

    if (q) {
      const t = isAr ? (ev.title_ar ?? ev.title ?? '') : (ev.title ?? '');
      const s = isAr ? (ev.summary_ar ?? ev.summary ?? '') : (ev.summary ?? '');
      const hay = [t, s, ...(evTags ?? []).join(' ')].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }

    return true;
  };

  const sorted = [...events]
    .filter(matches)
    .sort((a, b) => {
      const ay = a.start?.year ?? 0;
      const by = b.start?.year ?? 0;
      return ay - by;
    });

  return sorted;
}
