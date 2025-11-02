import Link from 'next/link';
import { loadEras, getRelatedTimelineEvents } from '@/lib/loaders.timeline';
import { loadGazetteer } from '@/lib/loaders.places';
import type { TimelineEvent } from '@/lib/types';

function formatYear(value: number | null, locale: 'en' | 'ar'): string {
  if (value === null || typeof value === 'undefined') {
    return locale === 'ar' ? 'غير معروف' : 'Unknown';
  }
  if (value < 0) {
    const year = Math.abs(value);
    return locale === 'ar' ? `${year} ق.م.` : `${year} BCE`;
  }
  return String(value);
}

function formatRange(event: TimelineEvent, locale: 'en' | 'ar'): string {
  const startLabel = formatYear(event.start, locale);
  if (event.end === null || typeof event.end === 'undefined') {
    return startLabel;
  }
  const endLabel = formatYear(event.end, locale);
  return `${startLabel}–${endLabel}`;
}

type Props = { event: TimelineEvent; locale?: 'en' | 'ar' };

type PlaceMeta = {
  id: string;
  name: string;
  name_ar?: string;
};

function buildPlaceIndex(): Map<string, PlaceMeta> {
  const gazetteer = loadGazetteer();
  const index = new Map<string, PlaceMeta>();
  for (const place of gazetteer) {
    const payload: PlaceMeta = { id: place.id, name: place.name, name_ar: place.name_ar };
    index.set(place.id.toLowerCase(), payload);
    index.set(place.name.toLowerCase(), payload);
    if (place.alt_names) {
      for (const alt of place.alt_names) {
        index.set(alt.toLowerCase(), payload);
      }
    }
  }
  return index;
}

export default function TimelineEventDetail({ event, locale = 'en' }: Props) {
  const isArabic = locale === 'ar';
  const eras = loadEras();
  const era = event.era ? eras.find((e) => e.id === event.era) : null;
  const eraLabel = era ? (isArabic ? era.title_ar ?? era.title : era.title) : null;
  const dateLabel = formatRange(event, locale);
  const placesIndex = buildPlaceIndex();
  const related = getRelatedTimelineEvents(event, { locale, limit: 4 });

  const t = isArabic
    ? {
        summary: 'الملخّص',
        certaintyHeading: 'مستوى اليقين',
        certainty: {
          low: 'يقين منخفض',
          medium: 'يقين متوسط',
          high: 'يقين مرتفع',
        } as const,
        tags: 'وسوم',
        places: 'أماكن',
        viewOnMap: 'عرض على الخريطة',
        viewPlaceAlt: 'عرض صفحة المكان بالإنجليزية',
        related: 'أحداث مرتبطة',
        returnLink: '← العودة إلى الخط الزمني',
      }
    : {
        summary: 'Summary',
        certaintyHeading: 'Certainty',
        certainty: {
          low: 'Low certainty',
          medium: 'Medium certainty',
          high: 'High certainty',
        } as const,
        tags: 'Tags',
        places: 'Places',
        viewOnMap: 'View on map',
        viewPlaceAlt: 'View Arabic place page',
        related: 'Related timeline',
        returnLink: '← Back to timeline',
      } as const;

  return (
    <article
      className="space-y-6"
      dir={isArabic ? 'rtl' : 'ltr'}
      lang={isArabic ? 'ar' : undefined}
    >
      <p className="text-sm text-gray-600">
        <Link className="underline hover:no-underline" href={isArabic ? '/ar/timeline' : '/timeline'}>
          {t.returnLink}
        </Link>
      </p>

      <header className={isArabic ? 'font-arabic space-y-2 text-right' : 'space-y-2'}>
        {eraLabel ? (
          <p
            className={
              isArabic
                ? 'text-xs text-gray-500'
                : 'text-xs uppercase tracking-wide text-gray-500'
            }
          >
            {eraLabel}
          </p>
        ) : null}
        <h1 className="text-3xl font-semibold tracking-tight">{event.title}</h1>
        <p className="text-sm text-gray-600">{dateLabel}</p>
      </header>

      {event.summary ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">{t.summary}</h2>
          <p className="text-base text-gray-700 leading-relaxed">{event.summary}</p>
        </section>
      ) : null}

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-gray-700">{t.certaintyHeading}</h2>
        <p className="text-sm text-gray-700">{t.certainty[event.certainty]}</p>
      </section>

      {(event.tags?.length ?? 0) > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">{t.tags}</h2>
          <ul className="flex flex-wrap gap-2 text-sm text-gray-600">
            {event.tags.map((tag) => (
              <li key={tag} className="rounded border px-2 py-1">#{tag}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {(event.places?.length ?? 0) > 0 ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">{t.places}</h2>
          <ul className="space-y-2 text-sm">
            {event.places.map((raw) => {
              const key = raw.trim().toLowerCase();
              const match = placesIndex.get(key);
              const primaryLabel = match ? (isArabic ? match.name_ar ?? match.name : match.name) : raw;
              const placeId = match?.id;
              const placeHref = placeId
                ? isArabic
                  ? `/ar/places/${placeId}`
                  : `/places/${placeId}`
                : null;
              const altHref = placeId
                ? isArabic
                  ? `/places/${placeId}`
                  : `/ar/places/${placeId}`
                : null;
              const mapHref = placeId
                ? isArabic
                  ? `/ar/map?place=${encodeURIComponent(placeId)}`
                  : `/map?place=${encodeURIComponent(placeId)}`
                : null;

              return (
                <li key={raw} className={isArabic ? 'font-arabic space-y-1' : 'space-y-1'}>
                  {placeHref ? (
                    <Link className="underline hover:no-underline" href={placeHref}>
                      {primaryLabel}
                    </Link>
                  ) : (
                    <span>{primaryLabel}</span>
                  )}

                  {mapHref ? (
                    <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                      <Link
                        className="underline hover:no-underline"
                        href={mapHref}
                        aria-label={
                          isArabic
                            ? `عرض ${primaryLabel} على الخريطة`
                            : `View ${primaryLabel} on the map`
                        }
                      >
                        {t.viewOnMap} →
                      </Link>
                      {altHref ? (
                        <Link className="underline hover:no-underline" href={altHref}>
                          {t.viewPlaceAlt}
                        </Link>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-gray-700">{t.related}</h2>
          <ul className="space-y-2 text-sm">
            {related.map((item) => {
              const href = isArabic ? `/ar/timeline/${item.id}` : `/timeline/${item.id}`;
              return (
                <li key={item.id}>
                  <Link className="underline hover:no-underline" href={href}>
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
