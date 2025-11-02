import type { Era, TimelineEvent } from '@/lib/types';

export type EraFilterOptions = {
  eraIds: string[];
  logic?: 'and' | 'or';
  eras: Era[];
};

function normaliseEraIds(ids: string[]): string[] {
  return Array.from(new Set(ids.map((id) => id.trim()).filter(Boolean)));
}

function eventMatchesEra(event: TimelineEvent, era: Era | undefined, eraId: string): boolean {
  if (!era && event.era !== eraId) {
    return false;
  }

  if (event.era === eraId) {
    return true;
  }

  if (!era) {
    return false;
  }

  const start = Number.isFinite(event.start) ? event.start : Number(event.start);
  const end = Number.isFinite(event.end) ? (event.end as number) : event.start;
  const eraStart = era.start;
  const eraEnd = era.end ?? Number.POSITIVE_INFINITY;

  const eventEnd = Number.isFinite(end) ? (end as number) : start;

  return eventEnd >= eraStart && start <= eraEnd;
}

export function applyEraFilter(events: TimelineEvent[], options: EraFilterOptions): TimelineEvent[] {
  const logic = options.logic === 'and' ? 'and' : 'or';
  const eraIds = normaliseEraIds(options.eraIds ?? []);
  if (!eraIds.length) {
    return events;
  }

  const eraById = new Map(options.eras.map((era) => [era.id, era]));

  return events.filter((event) => {
    if (logic === 'or') {
      return eraIds.some((id) => eventMatchesEra(event, eraById.get(id), id));
    }

    return eraIds.every((id) => eventMatchesEra(event, eraById.get(id), id));
  });
}
