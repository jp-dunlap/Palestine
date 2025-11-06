// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';

import { LocaleProvider } from '@/components/LocaleLink';
import { interVariable, naskhVariable } from '@/app/ui/fonts';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine-two.vercel.app';
const tileOrigin = process.env.NEXT_PUBLIC_TILE_ORIGIN ?? 'https://tile.openstreetmap.org';
const siteName = 'Palestine — 4,000 Years of Memory';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteName,
  description:
    'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
  openGraph: {
    title: siteName,
    description:
      'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
    type: 'website',
    siteName,
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description:
      'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
  },
  alternates: {
    languages: { en: '/', ar: '/ar', 'x-default': '/' },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={[interVariable, naskhVariable, 'no-js'].filter(Boolean).join(' ')}
    >
      <head>
        <link rel="preconnect" href={tileOrigin} />
        <link rel="dns-prefetch" href={tileOrigin} />
      </head>
      <body className="font-sans">
        <LocaleProvider locale="en">
          <Script id="init-js" strategy="beforeInteractive">
            {`document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js-enabled');`}
          </Script>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 rounded bg-white px-3 py-1 text-sm shadow"
          >
            Skip to main content
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
