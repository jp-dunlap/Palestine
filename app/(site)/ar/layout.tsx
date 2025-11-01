import '../../globals.css';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

export const metadata = {
  title: 'فلسطين',
  description: 'تاريخ عام وفني لفلسطين'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic bg-white text-gray-900">
        <header className="border-b">
          <div className="mx-auto flex max-w-4xl justify-start px-4 py-3" dir="rtl">
            <Suspense fallback={<span className="text-sm text-gray-400">…</span>}>
              <LanguageSwitcher />
            </Suspense>
          </div>
        </header>
        <div>{children}</div>
      </body>
    </html>
  );
}
