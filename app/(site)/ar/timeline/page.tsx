import { loadEras, filterTimeline } from '@/lib/loaders.timeline';
import Timeline from '@/components/Timeline';
import TimelineFilters from '@/components/TimelineFilters';

export const metadata = {
  title: 'الخط الزمني',
  description: 'خط زمني عامّ لفلسطين مع العصور والأمكنة والمصادر.',
  alternates: { languages: { en: '/timeline' } },
};

export default function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const q = (searchParams?.q as string) || '';
  const eras = ((searchParams?.eras as string) || '').split(',').filter(Boolean);

  const events = filterTimeline({ q, eras });
  const allEras = loadEras();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 font-arabic">
      <h1 className="text-2xl font-semibold tracking-tight">الخط الزمني</h1>
      <TimelineFilters eras={allEras} />
      <Timeline events={events} eras={allEras} />
    </main>
  );
}
