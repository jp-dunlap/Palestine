// app/layout.tsx
import './globals.css';
import { isValidElement, type ReactNode } from 'react';
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

function normaliseLocale(value: unknown): Locale | null {
  if (typeof value === 'string') {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === 'en' || trimmed === 'ar') {
      return trimmed as Locale;
    }
    return null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const matched = normaliseLocale(entry);
      if (matched) {
        return matched;
      }
    }
  }

  return null;
}

function findLocale(node: ReactNode): Locale | null {
  if (node == null || typeof node === 'boolean') {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return null;
  }

  if (Array.isArray(node)) {
    for (const child of node) {
      const matched = findLocale(child);
      if (matched) {
        return matched;
      }
    }
    return null;
  }

  if (isValidElement(node)) {
    const props = node.props as Record<string, unknown> | undefined;
    if (props) {
      const directMatch =
        normaliseLocale(props['data-locale']) ??
        normaliseLocale(props.locale) ??
        normaliseLocale(props.lang);
      if (directMatch) {
        return directMatch;
      }

      const childMatch = findLocale(props.children as ReactNode);
      if (childMatch) {
        return childMatch;
      }

      for (const [key, value] of Object.entries(props)) {
        if (key === 'children') {
          continue;
        }
        if (typeof value === 'function') {
          continue;
        }
        const nestedMatch = findLocale(value as ReactNode);
        if (nestedMatch) {
          return nestedMatch;
        }
      }
    }
  }

  return null;
}

type RootLayoutParams = Record<string, string | string[] | undefined> | undefined;

function determineLocaleFromParams(params: RootLayoutParams): Locale | null {
  if (!params) {
    return null;
  }

  const preferredKeys = ['lang', 'locale', 'language'];
  for (const key of preferredKeys) {
    const value = params[key];
    const matched = normaliseLocale(value);
    if (matched) {
      return matched;
    }
  }

  for (const value of Object.values(params)) {
    const matched = normaliseLocale(value);
    if (matched) {
      return matched;
    }
  }

  return null;
}

function determineLocaleFromPath(pathname: string | null): Locale | null {
  if (!pathname) {
    return null;
  }

  const trimmed = pathname.trim().toLowerCase();
  if (!trimmed) {
    return null;
  }

  if (trimmed === '/ar' || trimmed.startsWith('/ar/')) {
    return 'ar';
  }

  if (trimmed === '/en' || trimmed.startsWith('/en/')) {
    return 'en';
  }

  return null;
}

function resolveLocale(
  params: RootLayoutParams,
  pathname: string | null,
  children: ReactNode,
): Locale {
  return (
    determineLocaleFromParams(params) ??
    determineLocaleFromPath(pathname) ??
    findLocale(children) ??
    'en'
  );
}

export default async function RootLayout({
  children,
  params = {},
}: {
  children: ReactNode;
  params?: Record<string, string | string[] | undefined>;
}) {
  const headerList = await headers();
  const inferredPathname =
    headerList.get('x-matched-path') ??
    headerList.get('x-invoke-path') ??
    headerList.get('x-url') ??
    null;

  const locale = resolveLocale(params, inferredPathname, children);
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
