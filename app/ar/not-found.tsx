import type { Metadata } from 'next';

import FocusHeading from '@/components/FocusHeading';
import LocaleLink from '@/components/LocaleLink';

export const metadata: Metadata = {
  title: 'الصفحة غير موجودة — فلسطين',
};

export default function NotFoundAr() {
  return (
    <main
      id="main"
      dir="rtl"
      className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center font-arabic"
    >
      <FocusHeading className="text-4xl font-bold tracking-tight">الصفحة غير موجودة</FocusHeading>
      <p className="max-w-xl text-base text-gray-800">
        الصفحة التي تبحث عنها غير موجودة أو ربما تم نقلها. يمكنك الرجوع إلى الصفحة الرئيسية أو استكشاف الخط الزمني.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <LocaleLink
          href="/ar"
          locale="ar"
          className="rounded border border-gray-900 px-4 py-2 text-gray-900 transition hover:bg-gray-900 hover:text-white"
        >
          العودة إلى الرئيسية
        </LocaleLink>
        <LocaleLink
          href="/ar/timeline"
          locale="ar"
          className="rounded px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
        >
          استكشاف الخط الزمني
        </LocaleLink>
      </nav>
    </main>
  );
}
