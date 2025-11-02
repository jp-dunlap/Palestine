// app/timeline/page.tsx
import { Suspense } from 'react';
import TimelinePageClient from '@/components/TimelinePageClient'; // ✅ default import, not `* as` or named
import { loadTimelineEvents, loadEras } from '@/lib/loaders.timeline';

export const metadata = {
  title: 'Timeline',
  description: 'A chronological view of events with filters and search.',
};

export default async function Page() {
  // These are Server functions; fine to run here.
  const events = await loadTimelineEvents();
  const eras = loadEras();

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="sr-only">Timeline</h1>
      <Suspense fallback={null}>
        {/* 👇 Client component rendered inside Suspense */}
        <TimelinePageClient events={events} eras={eras} />
      </Suspense>
    </main>
  );
}
