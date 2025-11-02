import Link from 'next/link';

export const metadata = {
  title: 'وحدات تعليمية',
  description: 'مواد جاهزة للتيسير، وأسئلة نقاش، وموارد للورش حول التاريخ الفلسطيني.',
  alternates: {
    canonical: '/ar/learn',
    languages: { en: '/learn', ar: '/ar/learn', 'x-default': '/learn' },
  },
  openGraph: { url: '/ar/learn' },
  twitter: {
    card: 'summary_large_image',
    title: 'وحدات تعليمية',
    description: 'مواد جاهزة للتيسير، وأسئلة نقاش، وموارد للورش حول التاريخ الفلسطيني.',
  },
};

export default function LearnIndexPageAr() {
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-semibold tracking-tight">وحدات تعليمية</h1>
      <p className="mt-2 text-base text-gray-600">
        نعمل على تعريب هذه الدروس التدريبية. في الوقت الحالي يمكنك استخدام النسخة الإنجليزية ومصادرها المفتوحة، أو إرسال موادك
        التعليمية للفريق.
      </p>

      <div className="mt-6 text-sm text-gray-700" dir="ltr">
        <Link className="underline hover:no-underline" href="/learn">
          View the English lessons →
        </Link>
      </div>

      <p className="mt-10 text-sm text-gray-600">
        لديك منهج مجتمعي لمشاركته؟ <Link className="underline hover:no-underline" href="/ar/submit">أرسل موادك هنا.</Link>
      </p>
    </main>
  );
}
