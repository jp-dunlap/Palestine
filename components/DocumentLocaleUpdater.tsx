"use client";

import { useEffect } from 'react';

import { useLocale } from '@/components/LocaleLink';

const ARABIC_BODY_CLASSES = ['font-arabic', 'bg-white', 'text-gray-900'] as const;
const ENGLISH_BODY_CLASSES = ['font-sans'] as const;

export default function DocumentLocaleUpdater(): null {
  const locale = useLocale();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const isArabic = locale === 'ar';

    html.lang = isArabic ? 'ar' : 'en';
    html.dir = isArabic ? 'rtl' : 'ltr';
    html.dataset.locale = locale;

    body.lang = html.lang;
    body.dir = html.dir;
    body.dataset.locale = locale;

    for (const className of ARABIC_BODY_CLASSES) {
      body.classList.toggle(className, isArabic);
    }

    for (const className of ENGLISH_BODY_CLASSES) {
      body.classList.toggle(className, !isArabic);
    }
  }, [locale]);

  return null;
}
