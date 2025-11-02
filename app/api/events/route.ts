import { NextResponse } from 'next/server';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

export const dynamic = 'force-static';

export async function GET() {
  const events = loadTimelineEvents().map((event) => ({
    id: event.id,
    title: event.title,
    summary: event.summary,
    start: event.start,
    end: event.end,
    era: event.era ?? null,
    certainty: event.certainty,
    places: event.places,
    tags: event.tags,
  }));

  return NextResponse.json({ events });
}
