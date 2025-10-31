// app/places/[id]/page.tsx
import { notFound } from 'next/navigation';
import { loadGazetteer } from '@/lib/loaders.places';
import type { Metadata } from 'next';

export const dynamic = 'force-static';

export async function generateStaticParams() {
  const places = loadGazetteer();
  return places.map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const place = loadGazetteer().find((p) => p.id === params.id);
  if (!place) return {};
  const alt = place.alt_names?.length ? ` · ${place.alt_names.join(', ')}` : '';
  return {
    title: `${place.name}${alt ? '' : ''}`,
    alternates: { canonical: `/places/${place.id}` },
    openGraph: {
      title: place.name,
      description: `${place.kind ?? 'place'} · ${place.lat}, ${place.lon}`,
      images: ['/opengraph-image'],
    },
  };
}

export default function PlacePage({ params }: { params: { id: string } }) {
  const place = loadGazetteer().find((p) => p.id === params.id);
  if (!place) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{place!.name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {place!.kind ?? 'place'} · {place!.lat.toFixed(3)}, {place!.lon.toFixed(3)}
      </p>
      {place!.alt_names?.length ? (
        <p className="mt-2 text-sm text-gray-600">
          Also known as: {place!.alt_names.join(', ')}
        </p>
      ) : null}
      <p className="mt-6 text-sm">
        <a className="underline hover:no-underline" href="/maps?place=${params.id}">
          View on map →
        </a>
      </p>
    </main>
  );
}
