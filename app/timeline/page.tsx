import { Suspense } from 'react';
import { loadEras, filterTimeline } from '@/lib/loaders.timeline';
import Timeline from '@/components/Timeline';
import TimelineFilters from '@/components/TimelineFilters';

export const metadata = {
  title: 'Timeline',
  description: 'A public, art-grade timeline of Palestine with eras, places, and sources.',
  alternates: {
    canonical: '/timeline',
    languages: { en: '/timeline', ar: '/ar/timeline', 'x-default': '/timeline' },
  },
  openGraph: { url: '/timeline' },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const q = (searchParams?.q as string) || '';
  const eras = ((searchParams?.eras as string) || '').split(',').filter(Boolean);

  const allEras = loadEras();
  const events = filterTimeline({ q, eras, locale: 'en' });

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Timeline</h1>
      <Suspense
        fallback={<div className="mb-6 h-24 animate-pulse rounded border" aria-hidden="true" />}
      >
        <TimelineFilters eras={allEras} locale="en" resultCount={events.length} />
      </Suspense>
      <Timeline events={events} eras={allEras} locale="en" />
    </main>
  );
}
