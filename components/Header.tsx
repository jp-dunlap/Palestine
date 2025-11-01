'use client';

import LanguageSwitcher from './LanguageSwitcher';
import { usePathname } from 'next/navigation';

export default function Header({ locale = 'en' as 'en' | 'ar' }) {
  const pathname = usePathname() || '/';
  const isAr = locale === 'ar';

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <a href={isAr ? '/ar' : '/'} className="font-semibold">
          {isAr ? 'فلسطين — ٤٠٠٠ سنة من الذاكرة' : 'Palestine — 4,000 Years of Memory'}
        </a>
        <nav className="flex items-center gap-4" dir={isAr ? 'rtl' : 'ltr'}>
          <a href={isAr ? '/ar/timeline' : '/timeline'} className="text-sm underline hover:no-underline">
            {isAr ? 'الخطّ الزمني' : 'Timeline'}
          </a>
          <a href={isAr ? '/ar/map' : '/map'} className="text-sm underline hover:no-underline">
            {isAr ? 'الخريطة' : 'Map'}
          </a>
          <LanguageSwitcher locale={isAr ? 'ar' : 'en'} />
        </nav>
      </div>
    </header>
  );
}
