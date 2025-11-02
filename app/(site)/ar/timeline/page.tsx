import { Suspense } from 'react';
import { loadEras, filterTimeline } from '@/lib/loaders.timeline';
import Timeline from '@/components/Timeline';
import TimelineFilters from '@/components/TimelineFilters';

export const metadata = {
  title: 'الخط الزمني',
  description: 'خط زمني عامّ لفلسطين مع العصور والأمكنة والمصادر.',
  alternates: {
    canonical: '/ar/timeline',
    languages: { en: '/timeline', ar: '/ar/timeline', 'x-default': '/timeline' },
  },
  openGraph: { url: '/ar/timeline' },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const q = (searchParams?.q as string) || '';
  const eras = ((searchParams?.eras as string) || '').split(',').filter(Boolean);

  const allEras = loadEras();
  const events = filterTimeline({ q, eras, locale: 'ar' });

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 font-arabic" dir="rtl" lang="ar">
      <h1 className="text-2xl font-semibold tracking-tight">الخط الزمني</h1>
      <Suspense
        fallback={
          <div className="mb-6 h-24 animate-pulse rounded border" aria-hidden="true" dir="rtl" />
        }
      >
        <TimelineFilters eras={allEras} locale="ar" resultCount={events.length} />
      </Suspense>
      <Timeline events={events} eras={allEras} locale="ar" />
    </main>
  );
}
