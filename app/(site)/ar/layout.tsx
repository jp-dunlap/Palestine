// app/(site)/ar/layout.tsx
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import Header from '@/components/Header';
import SkipLink from '@/components/SkipLink';

export default function ArLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans">
        <SkipLink />
        <Suspense fallback={<div className="h-10" />}>
          <Header locale="ar" />
        </Suspense>
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
