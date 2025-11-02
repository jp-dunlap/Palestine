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
      <noscript>
        <div className="mt-2 rounded border bg-yellow-50 p-3 text-sm text-yellow-800 font-arabic" dir="rtl">
          <p className="font-semibold font-arabic">تم تعطيل JavaScript.</p>
          <p className="mt-1 font-arabic">
            ما زال بإمكانك تصفّح الأماكن أدناه — استخدم روابط «فتح صفحة المكان» أو «فتح على الخريطة» في كل بطاقة.
          </p>
        </div>
      </noscript>

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
