import { NextResponse } from 'next/server';
import { loadGazetteer } from '@/lib/loaders.places';

export const dynamic = 'force-static';

export async function GET() {
  const places = loadGazetteer().map((place) => ({
    id: place.id,
    name: place.name,
    name_ar: place.name_ar ?? null,
    lat: place.lat,
    lon: place.lon,
    kind: place.kind ?? null,
    alt_names: place.alt_names ?? [],
  }));

  return NextResponse.json({ places });
}
