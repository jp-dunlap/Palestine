import type { ReactNode } from 'react';
import { Suspense } from 'react';
import type { Metadata } from 'next';

import LanguageSwitcher from '@/components/LanguageSwitcher';

const siteName = 'Palestine — 4,000 Years of Memory';

export const metadata: Metadata = {
  title: 'فلسطين',
  description: 'تاريخ عام وفني لفلسطين',
  openGraph: {
    title: 'فلسطين',
    description: 'تاريخ عام وفني لفلسطين',
    type: 'website',
    url: '/ar',
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فلسطين',
    description: 'تاريخ عام وفني لفلسطين',
  },
  alternates: {
    canonical: '/ar',
    languages: { en: '/', ar: '/ar', 'x-default': '/' },
  },
};

export default function ArabicSiteSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen bg-white text-gray-900 font-arabic"
      data-locale="ar"
      dir="rtl"
      lang="ar"
    >
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl justify-end rtl:justify-start px-4 py-3">
          <Suspense fallback={<span className="text-sm text-gray-400 font-arabic">…</span>}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
