// app/map/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClient from '@/components/MapsPageClient';

export const metadata = {
  title: 'Map of Palestinian places',
  description: 'Interactive map drawn from the project gazetteer.',
  alternates: { languages: { ar: '/ar/map' } },
};

export default function MapsPage({
  searchParams,
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;

  const arHref = initialFocusId ? `/ar/map?place=${initialFocusId}` : '/ar/map';

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Places</h1>
      <p className="mt-2 text-sm text-gray-600">
        Loaded from <code>data/gazetteer.json</code>
      </p>

      <MapsPageClient places={places} cfg={cfg} initialFocusId={initialFocusId} />

      <p className="mt-8 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={arHref}>
          View this map in Arabic →
        </a>
      </p>
    </main>
  );
}
