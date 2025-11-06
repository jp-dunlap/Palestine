import LocaleLink from '@/components/LocaleLink';

export default function NotFoundAr() {
  return (
    <main
      id="main"
      tabIndex={-1}
      dir="rtl"
      lang="ar"
      className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 text-center"
    >
      <h1 className="text-4xl font-bold tracking-tight">٤٠٤ — الصفحة غير موجودة</h1>
      <p className="max-w-xl text-base text-gray-600">
        لم نعثر على الصفحة المطلوبة. قد تكون أُزيلت أو نُقلت.
      </p>
      <nav className="flex flex-wrap items-center justify-center gap-4 text-sm font-medium">
        <LocaleLink
          href="/ar"
          locale="ar"
          className="rounded px-4 py-2 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          aria-label="العودة إلى الصفحة الرئيسية العربية"
        >
          العودة إلى الصفحة الرئيسية
        </LocaleLink>
        <LocaleLink
          href="/"
          locale="en"
          className="rounded px-4 py-2 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
          dir="ltr"
          aria-label="View English homepage"
        >
          English
        </LocaleLink>
      </nav>
    </main>
  );
}
