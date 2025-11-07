import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';
import { loadGazetteer } from '@/lib/loaders.places';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

export default async function PlaceTwitterImage({ params }: { params: { id: string } }) {
  const place = loadGazetteer().find((entry) => entry.id === params.id);
  const title = place?.name ?? 'Palestine Place';
  const description = place
    ? `${place.kind ?? 'place'} · ${place.lat.toFixed(3)}, ${place.lon.toFixed(3)}`
    : 'Geographies of liberation across Palestine.';
  const eyebrow = place ? 'PLACE • PALESTINE' : 'PLACE • MEMORY';
  return createSocialImage({
    locale: 'en',
    title,
    description,
    eyebrow,
  });
}
