// app/layout.tsx
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Noto_Naskh_Arabic } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  variable: '--font-naskh',
});

const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
const titleDefault = 'Palestine — 4,000 Years of Memory';
const description =
  'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.';

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: titleDefault, template: '%s · Palestine' },
  description,
  alternates: {
    canonical: '/',
    languages: { en: '/', ar: '/ar' },
  },
  openGraph: {
    type: 'website',
    url: site,
    siteName: 'Palestine',
    title: titleDefault,
    description,
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: titleDefault,
    description,
    images: ['/opengraph-image'],
  },
  icons: { icon: '/favicon.ico' },
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Arabic pages set dir/lang on their own page components */}
      <body className={`${inter.variable} ${naskh.variable} font-sans`}>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
