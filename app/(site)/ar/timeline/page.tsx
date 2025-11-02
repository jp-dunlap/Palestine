// app/(site)/ar/timeline/page.tsx
import { Suspense } from 'react';
import TimelinePageClient from '@/components/TimelinePageClient'; // ✅ default import
import { loadTimelineEvents, loadEras } from '@/lib/loaders.timeline';

export const metadata = {
  title: 'الخط الزمني',
  description: 'عرض زمني للأحداث مع فلاتر وبحث.',
  alternates: { languages: { en: '/timeline' } },
};

export default async function Page() {
  const events = await loadTimelineEvents();
  const eras = loadEras();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8" dir="rtl" lang="ar">
      <h1 className="sr-only">الخط الزمني</h1>
      <Suspense fallback={null}>
        <TimelinePageClient events={events} eras={eras} />
      </Suspense>
    </main>
  );
}
