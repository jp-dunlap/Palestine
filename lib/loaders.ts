import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';
import type { TimelineEvent } from '@/lib/types';

const TL_DIR = path.join(process.cwd(), 'content', 'timeline');

export function loadTimeline(): TimelineEvent[] {
  const files = fs.readdirSync(TL_DIR).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  const events: TimelineEvent[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(TL_DIR, file), 'utf8');
    const data = parse(raw) as any;

    const evt: TimelineEvent = {
      id: String(data.id),
      title: String(data.title),
      start: Number(data.start),
      end:
        data.end === null || typeof data.end === 'undefined' ? null : Number(data.end),
      places: Array.isArray(data.places) ? data.places.map(String) : [],
      sources: Array.isArray(data.sources) ? data.sources.map(String) : [],
      summary: String(data.summary ?? ''),
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      certainty: (['low', 'medium', 'high'].includes(data.certainty)
        ? data.certainty
        : 'medium') as 'low' | 'medium' | 'high'
    };

    events.push(evt);
  }

  // Sort by start year, then title
  events.sort((a, b) => (a.start - b.start) || a.title.localeCompare(b.title));
  return events;
}
