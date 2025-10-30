// app/(site)/ar/maps/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClientAr from '@/components/MapsPageClient.ar';

export default function MapsPageAr({
  searchParams
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <h1 className="text-2xl font-semibold tracking-tight">الأماكن</h1>
      <p className="mt-2 text-sm text-gray-600">
        مُحمّل من <code>data/gazetteer.json</code>
      </p>

      <MapsPageClientAr places={places} cfg={cfg} initialFocusId={initialFocusId} />
    </main>
  );
}
