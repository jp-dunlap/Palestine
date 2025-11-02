// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import Script from 'next/script';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine-two.vercel.app';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Palestine — 4,000 Years of Memory',
  description:
    'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
  openGraph: {
    title: 'Palestine — 4,000 Years of Memory',
    description:
      'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Palestine — 4,000 Years of Memory',
    description:
      'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
  },
  alternates: {
    languages: { ar: '/ar' },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="no-js">
      <body className="font-sans">
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
      </body>
    </html>
  );
}
