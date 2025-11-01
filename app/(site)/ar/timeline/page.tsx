import { loadEras, loadTimelineEvents } from '@/lib/timeline.api';
import TimelineClient from '@/components/TimelineClient';

export const metadata = {
  title: 'الخط الزمني',
  description: 'سرد زمني لتاريخ فلسطين.',
};

export default function Page() {
  const eras = loadEras();
  const events = loadTimelineEvents();
  return (
    <main className="mx-auto max-w-5xl px-4 py-8" dir="rtl" lang="ar">
      <h1 className="mb-4 text-2xl font-semibold font-arabic">الخط الزمني</h1>
      <TimelineClient events={events} eras={eras} locale="ar" />
    </main>
  );
}
