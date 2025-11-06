import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function MapOgImage() {
  return createSocialImage({
    locale: 'en',
    title: 'Map of Palestinian Places',
    description: 'Interactive map built from the project gazetteer and community research.',
    eyebrow: 'PALESTINE • MAP',
  });
}
