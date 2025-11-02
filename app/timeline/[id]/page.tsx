import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TimelineEventDetail from '@/components/TimelineEventDetail';
import JsonLd from '@/components/JsonLd';
import { loadGazetteer } from '@/lib/loaders.places';
import { getTimelineEventById, loadTimelineEvents } from '@/lib/loaders.timeline';

export const dynamic = 'force-static';

export function generateStaticParams() {
  const events = loadTimelineEvents();
  return events.map((event) => ({ id: event.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const event = getTimelineEventById(params.id, { locale: 'en' });
  if (!event) {
    return {
      title: 'Timeline event',
      alternates: { languages: { ar: `/ar/timeline/${params.id}` } },
    };
  }

  return {
    title: event.title,
    description: event.summary ?? undefined,
    alternates: {
      canonical: `/timeline/${event.id}`,
      languages: {
        en: `/timeline/${event.id}`,
        ar: `/ar/timeline/${event.id}`,
      },
    },
    openGraph: {
      title: event.title,
      description: event.summary ?? undefined,
      images: [`/timeline/${event.id}/opengraph-image`],
      url: `/timeline/${event.id}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: event.title,
      description: event.summary ?? undefined,
      images: [`/timeline/${event.id}/opengraph-image`],
    },
  };
}

export default function TimelineEventPage({ params }: { params: { id: string } }) {
  const event = getTimelineEventById(params.id, { locale: 'en' });
  if (!event) notFound();

  const isArabic = false;
  const gazetteer = loadGazetteer();
  const placeIndex = new Map<string, (typeof gazetteer)[number]>();
  const normalize = (value: string) => value.trim().toLowerCase();
  for (const place of gazetteer) {
    placeIndex.set(normalize(place.id), place);
    placeIndex.set(normalize(place.name), place);
    for (const alt of place.alt_names ?? []) {
      placeIndex.set(normalize(String(alt)), place);
    }
    if (place.name_ar) {
      placeIndex.set(normalize(place.name_ar), place);
    }
  }

  const locations = (event.places ?? []).map((raw) => {
    const key = normalize(String(raw));
    const match = placeIndex.get(key);
    if (!match) {
      return {
        '@type': 'Place',
        name: String(raw),
      };
    }

    const altNames = [match.name_ar, ...(match.alt_names ?? [])].filter(Boolean);
    const urlBase = isArabic ? '/ar/places' : '/places';

    return {
      '@type': 'Place',
      name: match.name,
      ...(altNames.length ? { alternateName: altNames } : {}),
      url: `${urlBase}/${match.id}`,
      geo: {
        '@type': 'GeoCoordinates',
        latitude: match.lat,
        longitude: match.lon,
      },
    };
  });

  const startDate = event.start >= 1 ? `${event.start}-01-01` : undefined;
  const endDate = typeof event.end === 'number' && event.end >= 1 ? `${event.end}-01-01` : undefined;
  const eventUrl = isArabic ? `/ar/timeline/${event.id}` : `/timeline/${event.id}`;

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        id={`ld-event-${event.id}`}
        data={{
          '@context': 'https://schema.org',
          '@type': 'Event',
          name: event.title,
          description: event.summary || undefined,
          url: eventUrl,
          inLanguage: isArabic ? 'ar' : 'en',
          eventStatus: 'https://schema.org/EventScheduled',
          ...(startDate ? { startDate } : {}),
          ...(endDate ? { endDate } : {}),
          ...(locations.length ? { location: locations } : {}),
        }}
      />
      <TimelineEventDetail event={event} locale="en" />
    </main>
  );
}
