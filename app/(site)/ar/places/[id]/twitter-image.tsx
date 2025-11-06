import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';
import { loadGazetteer } from '@/lib/loaders.places';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function PlaceTwitterImageAr({ params }: { params: { id: string } }) {
  const place = loadGazetteer().find((entry) => entry.id === params.id);
  const title = place?.name_ar ?? place?.name ?? 'مكان في فلسطين';
  const description = place
    ? `${place.kind ?? 'مكان'} · ${place.lat.toFixed(3)}, ${place.lon.toFixed(3)}`
    : 'جغرافيات التحرر في فلسطين.';
  const eyebrow = place ? 'المكان • فلسطين' : 'المكان • الذاكرة';
  return createSocialImage({
    locale: 'ar',
    title,
    description,
    eyebrow,
  });
}
