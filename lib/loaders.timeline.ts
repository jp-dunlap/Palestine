// lib/loaders.timeline.ts
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

const ROOT = process.cwd();
const TL_DIR = path.join(ROOT, 'data', 'timeline');
const ERAS_YML = path.join(ROOT, 'data', 'eras.yml');
const ERAS_YAML = path.join(ROOT, 'data', 'eras.yaml');

export type Era = {
  id: string;
  title: string;
  title_ar?: string;
  start?: number;
  end?: number;
};

export type TimelineEvent = {
  id: string;
  title: string;
  title_ar?: string;
  summary?: string;
  summary_ar?: string;
  tags?: string[];
  tags_ar?: string[];
  places?: string[];
  start: number;
  end?: number;
  era?: string; // may be missing in older files
};

function inferEra(start: number): string | undefined {
  // coarse defaults; adjust alongside data/eras.yml if needed
  if (start >= 1517 && start < 1917) return 'ottoman';
  if (start >= 1917 && start < 1948) return 'british-mandate';
  if (start >= 1948) return 'modern';
  return undefined;
}

let warned = false;

export function loadTimelineEvents(): TimelineEvent[] {
  if (!fs.existsSync(TL_DIR)) return [];
  const files = fs.readdirSync(TL_DIR).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  const out: TimelineEvent[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(TL_DIR, file), 'utf8');
    const data = YAML.parse(raw);
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      // Skip malformed
      continue;
    }
    const ev = data as Partial<TimelineEvent>;
    if (typeof ev.start !== 'number') {
      // Skip if missing required year
      continue;
    }
    const era = ev.era || inferEra(ev.start);
    if (!ev.era && era && !warned) {
      console.warn('[timeline] inferred era for events missing "era" (add era to YAML for accuracy)');
      warned = true;
    }
    out.push({
      id: String(ev.id ?? path.basename(file, path.extname(file))),
      title: String(ev.title ?? ''),
      title_ar: ev.title_ar ? String(ev.title_ar) : undefined,
      summary: ev.summary ? String(ev.summary) : undefined,
      summary_ar: ev.summary_ar ? String(ev.summary_ar) : undefined,
      tags: Array.isArray(ev.tags) ? ev.tags.map(String) : [],
      tags_ar: Array.isArray(ev.tags_ar) ? ev.tags_ar.map(String) : [],
      places: Array.isArray(ev.places) ? ev.places.map(String) : [],
      start: Number(ev.start),
      end: typeof ev.end === 'number' ? ev.end : undefined,
      era,
    });
  }

  // chronological sort
  out.sort((a, b) => (a.start - b.start) || a.id.localeCompare(b.id));
  return out;
}

export function loadEras(): Era[] {
  let eras: Era[] | null = null;

  const read = (p: string) => {
    const raw = fs.readFileSync(p, 'utf8');
    const data = YAML.parse(raw);
    if (Array.isArray(data)) {
      return data.map((e: any) => ({
        id: String(e.id),
        title: String(e.title ?? ''),
        title_ar: e.title_ar ? String(e.title_ar) : undefined,
        start: typeof e.start === 'number' ? e.start : undefined,
        end: typeof e.end === 'number' ? e.end : undefined,
      })) as Era[];
    }
    if (data && typeof data === 'object') {
      return Object.keys(data).map((k) => {
        const e = (data as any)[k] ?? {};
        return {
          id: String(k),
          title: String(e.title ?? ''),
          title_ar: e.title_ar ? String(e.title_ar) : undefined,
          start: typeof e.start === 'number' ? e.start : undefined,
          end: typeof e.end === 'number' ? e.end : undefined,
        } as Era;
      });
    }
    return null;
  };

  if (fs.existsSync(ERAS_YML)) eras = read(ERAS_YML);
  if (!eras && fs.existsSync(ERAS_YAML)) eras = read(ERAS_YAML);

  if (!eras) {
    // Fallback eras
    eras = [
      { id: 'bronze-age', title: 'Bronze Age', title_ar: 'العصر البرونزي', start: -3300, end: -1200 },
      { id: 'iron-age', title: 'Iron Age', title_ar: 'العصر الحديدي', start: -1200, end: -539 },
      { id: 'classical', title: 'Classical Antiquity', title_ar: 'العصور الكلاسيكية', start: -539, end: 700 },
      { id: 'islamic', title: 'Islamic', title_ar: 'العصر الإسلامي', start: 700, end: 1517 },
      { id: 'ottoman', title: 'Ottoman', title_ar: 'العثماني', start: 1517, end: 1917 },
      { id: 'british-mandate', title: 'British Mandate', title_ar: 'الانتداب البريطاني', start: 1917, end: 1948 },
      { id: 'modern', title: 'Modern', title_ar: 'الحديث', start: 1948 },
    ];
  }

  return eras;
}

export function filterTimeline(
  events: TimelineEvent[],
  opts: { query?: string; era?: string; tag?: string; place?: string } = {}
): TimelineEvent[] {
  const { query, era, tag, place } = opts;
  const q = (query ?? '').trim().toLowerCase();
  const eraId = (era ?? '').trim().toLowerCase();
  const t = (tag ?? '').trim().toLowerCase();
  const pl = (place ?? '').trim().toLowerCase();

  return events.filter((ev) => {
    if (q) {
      const hay = [
        ev.title,
        ev.title_ar,
        ev.summary,
        ev.summary_ar,
        ...(ev.tags ?? []),
        ...(ev.tags_ar ?? []),
        ...(ev.places ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (eraId) {
      const e = (ev.era ?? '').toLowerCase();
      if (e !== eraId) return false;
    }
    if (t) {
      const tagsLower = (ev.tags ?? []).map((x) => x.toLowerCase());
      const tagsArLower = (ev.tags_ar ?? []).map((x) => x.toLowerCase());
      if (![...tagsLower, ...tagsArLower].includes(t)) return false;
    }
    if (pl) {
      const placesLower = (ev.places ?? []).map((x) => x.toLowerCase());
      if (!placesLower.includes(pl)) return false;
    }
    return true;
  });
}
