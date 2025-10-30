import '../globals.css';
import type { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Noto_Naskh_Arabic } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  variable: '--font-naskh',
  weight: ['400', '700']
});

export const metadata = {
  title: 'Palestine',
  description: 'A public, art-grade digital history of Palestine'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <body className={`${inter.variable} ${naskh.variable} font-sans`}>
        {children}
      </body>
    </html>
  );
}
