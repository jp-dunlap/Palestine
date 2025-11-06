import { createSocialImage, socialImageContentType, socialImageSize } from '@/app/_og/renderer';

export const size = socialImageSize;
export const contentType = socialImageContentType;

export default function MapTwitterImageAr() {
  return createSocialImage({
    locale: 'ar',
    title: 'الأماكن الفلسطينية — خريطة تفاعلية',
    description: 'ابحث عن القرى والمدن والمناظر الطبيعية من دليل فلسطين المشترك.',
    eyebrow: 'فلسطين • الخريطة',
  });
}
