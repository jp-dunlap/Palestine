// app/(site)/ar/opengraph-image.tsx
import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

export default async function OgAr() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  const domain = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return createSocialImage({
    locale: 'ar',
    title: '٤٠٠٠ سنة من الذاكرة',
    description: 'تاريخ ثنائي اللغة من فلسطين — خرائط وخطوط زمنية وفصول تمركز الذاكرة والتحرر.',
    eyebrow: 'فلسطين • أرشيف المقاومة',
    footer: domain,
  });
}
