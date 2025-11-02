// app/(site)/ar/map/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClientAr from '@/components/MapsPageClient.ar';

export const metadata = {
  title: 'الأماكن',
  description: 'خريطة تفاعلية للأماكن الفلسطينية.',
  alternates: {
    canonical: '/ar/map',
    languages: { en: '/map', ar: '/ar/map', 'x-default': '/map' },
  },
  openGraph: { url: '/ar/map' },
} as const;

export default function MapsPageAr({
  searchParams,
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;
  const enHref = initialFocusId ? `/map?place=${initialFocusId}` : '/map';

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
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
