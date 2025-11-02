// app/places/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { loadGazetteer } from '@/lib/loaders.places';

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
  const p = loadGazetteer().find((x) => x.id === params.id);
  if (!p) return {};
  const alt = p.alt_names?.length ? ` · ${p.alt_names.join(', ')}` : '';
  return {
    title: `${p.name}${alt}`,
    alternates: {
      canonical: `/places/${p.id}`,
      languages: { en: `/places/${p.id}`, ar: `/ar/places/${p.id}` },
    },
    openGraph: {
      title: p.name,
      description: `${p.kind ?? 'place'} · ${p.lat}, ${p.lon}`,
      images: ['/opengraph-image'],
      url: `/places/${p.id}`,
    },
  };
}

export default function PlacePage({ params }: { params: { id: string } }) {
  const p = loadGazetteer().find((x) => x.id === params.id);
  if (!p) notFound();

  const arHref = `/ar/places/${p.id}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {p.kind ?? 'place'} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
      </p>
      {p.alt_names?.length ? (
        <p className="mt-2 text-sm text-gray-600">Also known as: {p.alt_names.join(', ')}</p>
      ) : null}

      <p className="mt-6 text-sm">
        <a className="underline hover:no-underline" href={`/map?place=${encodeURIComponent(p.id)}`}>
          View on map →
        </a>
      </p>

      <p className="mt-8 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={arHref}>
          View this page in Arabic →
        </a>
      </p>
    </main>
  );
}
