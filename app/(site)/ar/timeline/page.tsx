import TimelinePageClient, { Era, TimelineEvent } from '@/components/TimelinePageClient';
import { loadTimelineEvents } from '@/lib/loaders.timeline';

function toEvent(e: any): TimelineEvent {
  return {
    id: String(e.id),
    title: String(e.title_ar || e.title || ''),
    summary: e.summary_ar ? String(e.summary_ar) : '',
    tags: Array.isArray(e.tags_ar) ? e.tags_ar.map(String) : [],
    era: e.era ? String(e.era) : undefined,
    href: `/ar/timeline#${e.id}`,
  };
}

export default function Page() {
  const all = loadTimelineEvents().map(toEvent);
  const erasMap = new Map<string, Era>();
  for (const e of all) {
    if (e.era) {
      const id = e.era;
      if (!erasMap.has(id)) {
        erasMap.set(id, { id, title: id, title_ar: id });
      }
    }
  }
  const eras = Array.from(erasMap.values());

  return (
    <main className="mx-auto max-w-3xl px-4 py-10" dir="rtl" lang="ar">
      <h1 className="text-2xl font-semibold tracking-tight font-arabic">الخطّ الزمني</h1>
      <div className="mt-6">
        <TimelinePageClient events={all} eras={eras} locale="ar" />
      </div>
    </main>
  );
}
