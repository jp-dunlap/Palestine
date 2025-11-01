import { loadEras, loadTimelineEvents } from '@/lib/timeline.api';
import TimelineClient from '@/components/TimelineClient';

export const metadata = {
  title: 'Timeline',
  description: 'A chronological timeline of Palestinian history.',
};

export default function Page() {
  const eras = loadEras();
  const events = loadTimelineEvents();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-semibold">Timeline</h1>
      <TimelineClient events={events} eras={eras} locale="en" />
    </main>
  );
}
