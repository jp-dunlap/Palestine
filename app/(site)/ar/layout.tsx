import '../../globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'فلسطين',
  description: 'تاريخ عام وفني لفلسطين'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="font-arabic">{children}</body>
    </html>
  );
}
