// app/layout.tsx
import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Noto_Naskh_Arabic } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-naskh',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine-two.vercel.app'),
  title: 'Palestine — 4,000 Years of Memory',
  description:
    'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
  openGraph: {
    title: 'Palestine — 4,000 Years of Memory',
    description:
      'A bilingual, anti-colonial history of Palestine across 4,000 years — maps, timelines, sources, and chapters.',
    type: 'website',
  },
  alternates: {
    languages: { en: '/', ar: '/ar' },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${naskh.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
