import '../../globals.css';
import type { ReactNode } from 'react';

import { LocaleProvider } from '@/components/LocaleLink';
import { interVariable, naskhVariable } from '@/app/ui/fonts';

export const metadata = {
  title: 'فلسطين',
  description: 'تاريخ عام وفني لفلسطين',
  openGraph: {
    title: 'فلسطين',
    description: 'تاريخ عام وفني لفلسطين',
    type: 'website',
    url: '/ar',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فلسطين',
    description: 'تاريخ عام وفني لفلسطين',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={[interVariable, naskhVariable].filter(Boolean).join(' ')}
    >
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
