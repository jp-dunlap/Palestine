import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

const issueUrl =
  'https://github.com/jp-dunlap/Palestine/issues/new?title=%D9%85%D8%B3%D8%A7%D9%87%D9%85%D8%A9&body=' +
  encodeURIComponent(
    [
      '## موجز',
      'اشرح المصدر أو الذاكرة أو التصحيح الذي تود إضافته.',
      '',
      '## تفاصيل المصدر',
      '- الروابط أو الصور الممسوحة',
      '- بيانات التوثيق',
      '',
      '## وسيلة تواصل مفضّلة (اختياري)',
      'استخدم قنوات عامة أو بديلة فقط. هذا المشروع لا يشغّل تتبعًا خاصًا.',
      '',
      '## ملاحظات',
      'أي معلومات إضافية نحتاج لمعرفتها.',
    ].join('\n')
  );

export const metadata = {
  title: 'إرسال مواد',
  description: 'شارك المصادر والذكريات أو التصحيحات مع الفريق التحريري. جميع المساهمات تمر عبر طابور عام للمراجعة.',
  alternates: {
    canonical: '/ar/submit',
    languages: { en: '/submit', ar: '/ar/submit', 'x-default': '/submit' },
  },
  openGraph: { url: '/ar/submit' },
  twitter: {
    card: 'summary_large_image',
    title: 'إرسال مواد',
    description: 'شارك المصادر والذكريات أو التصحيحات مع الفريق التحريري. جميع المساهمات تمر عبر طابور عام للمراجعة.',
  },
};

export default function SubmitPageAr() {
  const englishHref = buildLanguageToggleHref('/ar/submit', undefined, 'en');
  return (
    <main id="main" tabIndex={-1} className="mx-auto max-w-3xl px-4 py-12" dir="rtl">
      <h1 className="text-2xl font-semibold tracking-tight">إرسال مواد</h1>
      <p className="mt-2 text-base text-gray-600">
        يُدار المشروع من قبل فريق تحرير متطوع. لمشاركة المصادر أو الذكريات أو التصحيحات، افتح تذكرة على GitHub باستخدام
        القالب أدناه. تكون المساهمات عامة كي يتمكن المجتمع من المتابعة والعمل بشكل مفتوح.
      </p>

      <section className="mt-6 space-y-3 text-sm text-gray-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">خطوات المساهمة</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>اطلع على إرشادات المساهمة في <a className="underline hover:no-underline" href="/CONTRIBUTING">CONTRIBUTING.md</a>.</li>
          <li>حضّر الاستشهادات أو الصور الممسوحة أو الشهادات الشفوية. احذف أي بيانات حساسة قبل الرفع.</li>
          <li>
            افتح تذكرة عامة باستخدام الرابط أدناه. يمكنك استخدام اسم مستعار؛ لا تشارك أرقام هواتف شخصية أو وسائل مراقبة.
          </li>
        </ol>
      </section>

      <div className="mt-6">
        <a
          className="inline-flex items-center gap-2 rounded border border-gray-900 px-4 py-2 text-sm font-medium shadow-sm transition hover:bg-gray-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
          href={issueUrl}
          rel="noopener noreferrer"
          target="_blank"
        >
          فتح تذكرة مساهمة →
        </a>
      </div>

      <section className="mt-10 text-sm text-gray-700">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">ماذا يحدث لاحقًا؟</h2>
        <p className="mt-2">
          يراجع الفريق التحريري المساهمات أسبوعيًا. قد نتواصل عبر التذكرة إذا احتجنا لتوضيح أو مصادر إضافية. يتم توثيق
          المساهمات المقبولة علنًا كي تتمكن من الاستشهاد بها في أعمال أخرى للحراك.
        </p>
      </section>

      <p className="mt-10 text-sm text-gray-600" dir="ltr">
        <a className="underline hover:no-underline" href={englishHref}>
          View this page in English →
        </a>
      </p>
    </main>
  );
}
