import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'فلسطين — ٤٠٠٠ سنة من الذاكرة',
  description:
    'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
  openGraph: {
    title: 'فلسطين — ٤٠٠٠ سنة من الذاكرة',
    description:
      'سِجلّ عام وتاريخ رقمي فنّي يمتد على ٤٠٠٠ سنة — يركّز على الحياة الفلسطينية والذاكرة المناهضة للاستعمار.',
    type: 'website',
  },
  alternates: {
    languages: { en: '/' },
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body>
        <Header locale="ar" />
        <main className="font-arabic">{children}</main>
        <Footer locale="ar" />
      </body>
    </html>
  );
}
