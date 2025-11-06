// app/twitter-image.tsx
import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function TwitterImage() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  const domain = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return createSocialImage({
    locale: 'en',
    title: 'Palestine — 4,000 Years of Memory',
    description:
      'Explore anti-colonial timelines, maps, and chapters centering Palestinian life across millennia.',
    eyebrow: 'PALESTINE • SOCIAL GRAPH',
    footer: domain,
  });
}
