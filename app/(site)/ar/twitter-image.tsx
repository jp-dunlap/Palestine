// app/(site)/ar/twitter-image.tsx
import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

export default async function TwitterAr() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  const domain = site.replace(/^https?:\/\//, '').replace(/\/$/, '');
  return createSocialImage({
    locale: 'ar',
    title: 'فلسطين — ٤٠٠٠ سنة من الذاكرة',
    description: 'استكشف الخطوط الزمنية والخرائط والفصول التي تتمحور حول الحياة الفلسطينية عبر آلاف السنين.',
    eyebrow: 'فلسطين • الرسوم الاجتماعية',
    footer: domain,
  });
}
