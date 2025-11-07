import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;
export const runtime = 'nodejs';

export default async function MapOgImageAr() {
  return createSocialImage({
    locale: 'ar',
    title: 'خريطة الأماكن الفلسطينية',
    description: 'خريطة تفاعلية من دليل المشروع والبحث الشعبي.',
    eyebrow: 'فلسطين • الخريطة',
  });
}
