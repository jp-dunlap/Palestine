import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import TimelineEventDetail from '@/components/TimelineEventDetail';
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
  const event = getTimelineEventById(params.id, { locale: 'ar' });
  if (!event) {
    return {
      title: 'حدث على الخط الزمني',
      alternates: { languages: { en: `/timeline/${params.id}` } },
    };
  }

  return {
    title: event.title,
    description: event.summary ?? undefined,
    alternates: {
      canonical: `/ar/timeline/${event.id}`,
      languages: {
        en: `/timeline/${event.id}`,
        ar: `/ar/timeline/${event.id}`,
      },
    },
    openGraph: {
      title: event.title,
      description: event.summary ?? undefined,
      url: `/ar/timeline/${event.id}`,
      locale: 'ar',
      type: 'article',
    },
  };
}

export default function TimelineEventPageAr({ params }: { params: { id: string } }) {
  const event = getTimelineEventById(params.id, { locale: 'ar' });
  if (!event) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 font-arabic" dir="rtl" lang="ar">
      <TimelineEventDetail event={event} locale="ar" />
    </main>
  );
}
