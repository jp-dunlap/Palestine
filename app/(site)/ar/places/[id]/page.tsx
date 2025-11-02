// app/(site)/ar/places/[id]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
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
  return {
    title: p.name,
    alternates: {
      canonical: `/ar/places/${p.id}`,
      languages: { en: `/places/${p.id}`, ar: `/ar/places/${p.id}` },
    },
    openGraph: {
      title: p.name,
      description: `${p.kind ?? 'مكان'} · ${p.lat}, ${p.lon}`,
      images: ['/opengraph-image'],
      url: `/ar/places/${p.id}`,
    },
  };
}

export default function PlacePageAr({ params }: { params: { id: string } }) {
  const p = loadGazetteer().find((x) => x.id === params.id);
  if (!p) notFound();

  const enHref = `/places/${p.id}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <JsonLd
        id={`ld-place-${p.id}`}
        data={{
          '@context': 'https://schema.org',
          '@type': 'Place',
          name: p.name,
          alternateName: p.alt_names?.length ? p.alt_names : undefined,
          identifier: p.id,
          url: `/ar/places/${p.id}`,
          inLanguage: 'ar',
          geo: {
            '@type': 'GeoCoordinates',
            latitude: p.lat,
            longitude: p.lon,
          },
        }}
      />
      <h1 className="text-2xl font-semibold tracking-tight">{p.name}</h1>
      <p className="mt-2 text-sm text-gray-600">
        {(p.kind as string) ?? 'مكان'} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
      </p>
      {p.alt_names?.length ? (
        <p className="mt-2 text-sm text-gray-600">أسماء أخرى: {p.alt_names.join('، ')}</p>
      ) : null}

      <p className="mt-6 text-sm">
        <a className="underline hover:no-underline" href={`/ar/map?place=${encodeURIComponent(p.id)}`}>
          عرض على الخريطة →
        </a>
      </p>

      <p className="mt-8 text-sm text-gray-600">
        <a className="underline hover:no-underline" href={enHref}>
          ← English
        </a>
      </p>
    </main>
  );
}
