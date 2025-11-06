import '../../globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

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
        <div>{children}</div>
      </body>
    </html>
  );
}
