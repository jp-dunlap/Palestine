import { Inter, Noto_Naskh_Arabic } from 'next/font/google';

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const interVariable = 'variable' in inter ? inter.variable : '';

export const naskh = Noto_Naskh_Arabic({
  subsets: ['arabic'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-naskh',
});

export const naskhVariable = 'variable' in naskh ? naskh.variable : '';
