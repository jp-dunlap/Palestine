// app/map/page.tsx
import { loadGazetteer } from '@/lib/loaders.places';
import { loadMapConfig } from '@/lib/loaders.config';
import MapsPageClient from '@/components/MapsPageClient';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

export const metadata = {
  title: 'Map of Palestinian places',
  description: 'Interactive map drawn from the project gazetteer.',
  alternates: {
    canonical: '/map',
    languages: { en: '/map', ar: '/ar/map', 'x-default': '/map' },
  },
  openGraph: { url: '/map' },
  twitter: {
    card: 'summary_large_image',
    title: 'Map of Palestinian places',
    description: 'Interactive map drawn from the project gazetteer.',
  },
};

export default function MapsPage({
  searchParams,
}: {
  searchParams?: { place?: string };
}) {
  const places = loadGazetteer();
  const cfg = loadMapConfig();
  const initialFocusId = searchParams?.place;

  const arHref = buildLanguageToggleHref(
    '/map',
    initialFocusId ? { place: initialFocusId } : undefined,
    'ar'
  );

  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Places</h1>

      {/* Rendered only when JS is disabled */}
      <noscript>
        <div className="mt-2 rounded border bg-yellow-50 p-3 text-sm text-yellow-800">
          <p className="font-semibold">JavaScript is disabled.</p>
          <p className="mt-1">
            You can still browse places below — use "Open place page" or "Open on map" links
            on each card.
          </p>

          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {places.map((p) => (
              <li key={p.id} className="rounded border p-3">
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-600">
                  {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                </div>
                <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-3">
                  <a
                    href={`/places/${p.id}`}
                    className="underline hover:no-underline"
                    title="Open place page"
                  >
                    Open place page →
                  </a>
                  <a
                    href={`/map?place=${encodeURIComponent(p.id)}`}
                    className="underline hover:no-underline"
                    title="Open map focused on this place"
                  >
                    Open on map
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </noscript>

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
