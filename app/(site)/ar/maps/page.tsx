// app/(site)/ar/maps/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClientAr from '@/components/MapsPageClient.ar';

export const metadata = {
  title: 'الأماكن',
  description: 'خريطة تفاعلية للأماكن الفلسطينية.',
  alternates: { languages: { en: '/maps' } },
} as const;

export default function MapsPageAr({
  searchParams,
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;
  const enHref = initialFocusId ? `/maps?place=${initialFocusId}` : '/maps';

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <h1 className="text-2xl font-semibold tracking-tight font-arabic">الأماكن</h1>

      <div className="mt-4">
        <MapsPageClientAr places={places} cfg={cfg} initialFocusId={initialFocusId} />
      </div>

      <p className="mt-8 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={enHref}>
          ← English
        </a>
      </p>
    </main>
  );
}
