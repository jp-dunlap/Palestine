import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function MapTwitterImage() {
  return createSocialImage({
    locale: 'en',
    title: 'Palestinian Places — Interactive Map',
    description: 'Search villages, cities, and landscapes from the shared gazetteer of Palestine.',
    eyebrow: 'PALESTINE • MAP',
  });
}
