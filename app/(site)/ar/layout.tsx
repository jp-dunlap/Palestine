import '../../globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { LocaleProvider } from '@/components/LocaleLink';
import { interVariable, naskhVariable } from '@/app/ui/fonts';

const tileOrigin = process.env.NEXT_PUBLIC_TILE_ORIGIN ?? 'https://tile.openstreetmap.org';
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={[interVariable, naskhVariable].filter(Boolean).join(' ')}
    >
      <head>
        <link rel="preconnect" href={tileOrigin} />
        <link rel="dns-prefetch" href={tileOrigin} />
      </head>
      <body className="font-arabic bg-white text-gray-900">
        <LocaleProvider locale="ar">
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute rtl:focus:right-3 ltr:focus:left-3 focus:top-3 focus:z-50 rounded bg-white px-3 py-1 text-sm shadow"
          >
            تجاوز إلى المحتوى
          </a>
          <div>{children}</div>
        </LocaleProvider>
      </body>
    </html>
  );
}
