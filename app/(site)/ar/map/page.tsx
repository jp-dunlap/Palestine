// app/(site)/ar/map/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClientAr from '@/components/MapsPageClient.ar';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

export const metadata = {
  title: 'خريطة الأماكن الفلسطينية',
  description: 'خريطة تفاعلية مستمدة من دليل المشروع.',
  alternates: {
    canonical: '/ar/map',
    languages: { en: '/map', ar: '/ar/map', 'x-default': '/map' },
  },
  openGraph: { url: '/ar/map' },
  twitter: {
    card: 'summary_large_image',
    title: 'خريطة الأماكن الفلسطينية',
    description: 'خريطة تفاعلية مستمدة من دليل المشروع.',
  },
};

export default function MapsPageAr({
  searchParams,
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;

  const enHref = buildLanguageToggleHref(
    '/ar/map',
    initialFocusId ? { place: initialFocusId } : undefined,
    'en'
  );

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-semibold tracking-tight">الأماكن</h1>

      {/* يظهر فقط عندما تكون JavaScript معطّلة */}
      <noscript>
        <div className="mt-2 rounded border bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-semibold">تم تعطيل JavaScript.</p>
          <p className="mt-1">
            ما زال بإمكانك تصفّح الأماكن أدناه — استخدم روابط «فتح صفحة المكان» أو
            «فتح على الخريطة» في كل بطاقة.
          </p>

          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {places.map((p) => (
              <li key={p.id} className="rounded border p-3">
                <div className="font-medium">{p.name_ar ?? p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                </div>
                <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-3">
                  <a
                    href={`/ar/places/${p.id}`}
                    className="underline hover:no-underline"
                    title="فتح صفحة المكان"
                  >
                    فتح صفحة المكان →
                  </a>
                  <a
                    href={`/ar/map?place=${encodeURIComponent(p.id)}`}
                    className="underline hover:no-underline"
                    title="فتح الخريطة مركّزة على هذا المكان"
                  >
                    فتح على الخريطة
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </noscript>

      <MapsPageClientAr places={places} cfg={cfg} initialFocusId={initialFocusId} />

      <p className="mt-8 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={enHref} dir="ltr">
          عرض هذه الخريطة بالإنجليزية →
        </a>
      </p>
    </main>
  );
}
