'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import FocusHeading from '@/components/FocusHeading';
import { interVariable, naskhVariable } from '@/app/ui/fonts';

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorAr({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const fontClass = [interVariable, naskhVariable].filter(Boolean).join(' ');

  return (
    <html lang="ar" dir="rtl" className={fontClass}>
      <body className="font-arabic bg-white text-gray-900">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:right-3 focus:top-3 focus:z-50 rounded bg-white px-3 py-1 text-sm shadow"
        >
          تخطَّ إلى المحتوى الرئيسي
        </a>
        <main
          id="main"
          dir="rtl"
          className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center"
        >
          <FocusHeading className="text-4xl font-bold tracking-tight">حدث خطأ غير متوقع</FocusHeading>
          <p className="max-w-xl text-base text-gray-800">
            واجهنا خطأ أثناء تحميل الصفحة. يمكنك المحاولة مجددًا أو العودة إلى الصفحة الرئيسية.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
            <button
              type="button"
              onClick={reset}
              className="rounded border border-gray-900 px-4 py-2 text-gray-900 transition hover:bg-gray-900 hover:text-white"
            >
              حاول مجددًا
            </button>
            <Link
              href="/ar"
              className="rounded border border-transparent px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
            >
              العودة إلى الرئيسية
            </Link>
            <Link
              href="/ar/timeline"
              className="rounded border border-transparent px-4 py-2 text-gray-900 underline underline-offset-4 transition hover:text-gray-700"
            >
              استكشاف الخط الزمني
            </Link>
          </div>
        </main>
      </body>
    </html>
  );
}
