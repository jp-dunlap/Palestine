import type { ReactNode } from 'react';
import Header from '@/components/Header';
import SkipLink from '@/components/SkipLink';

export const metadata = {
  title: 'فلسطين — ٤٠٠٠ سنة من الذاكرة',
  description: 'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  openGraph: {
    title: 'فلسطين — ٤٠٠٠ سنة من الذاكرة',
    description: 'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
    type: 'website',
  },
  alternates: {
    languages: { en: '/' },
  },
};

export default function ArLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="font-sans">
        <SkipLink label="تجاوز إلى المحتوى" />
        <Header locale="ar" />
        <main id="main">{children}</main>
      </body>
    </html>
  );
}
