// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import Script from 'next/script';
import { headers } from 'next/headers';

import { LocaleProvider, type Locale } from '@/components/LocaleLink';
import SkipLink from '@/components/SkipLink';
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

function extractPath(candidate: string | null): string | null {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    try {
      const url = new URL(trimmed);
      return url.pathname || '/';
    } catch {
      return null;
    }
  }

  if (!trimmed.startsWith('/')) {
    return null;
  }

  const [path] = trimmed.split(/[?#]/, 1);
  return path && path.length > 0 ? path : '/';
}

function detectLocaleFromPath(pathname: string): Locale {
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    return 'ar';
  }
  return 'en';
}

function determineLocale(): Locale {
  const headerList = headers();
  const headerKeys = ['x-pathname', 'x-next-pathname', 'x-invoke-path', 'x-matched-path', 'next-url'] as const;

  for (const key of headerKeys) {
    const value = headerList.get(key);
    const path = extractPath(value);
    if (path) {
      return detectLocaleFromPath(path);
    }
  }

  const refererPath = extractPath(headerList.get('referer'));
  if (refererPath) {
    return detectLocaleFromPath(refererPath);
  }

  return 'en';
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const locale = determineLocale();
  const isArabic = locale === 'ar';
  const htmlLang = isArabic ? 'ar' : 'en';
  const direction = isArabic ? 'rtl' : 'ltr';
  const bodyClassName = isArabic ? 'font-arabic bg-white text-gray-900' : 'font-sans';

  return (
    <html
      lang={htmlLang}
      dir={direction}
      suppressHydrationWarning
      className={[interVariable, naskhVariable, 'no-js'].filter(Boolean).join(' ')}
    >
      <head>
        <link rel="preconnect" href={tileOrigin} />
        <link rel="dns-prefetch" href={tileOrigin} />
      </head>
      <body className={bodyClassName}>
        <LocaleProvider locale={locale}>
          <Script id="init-js" strategy="beforeInteractive">
            {`document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js-enabled');`}
          </Script>
          <SkipLink locale={locale} />
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}
