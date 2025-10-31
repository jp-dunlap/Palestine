// app/(site)/ar/page.tsx
export default function PageAr() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12" dir="rtl" lang="ar">
      <h1 className="text-3xl font-semibold tracking-tight">فلسطين</h1>
      <p className="mt-2 text-base text-gray-700">
        هذا هو المسار العربي للمشروع — تاريخ عام وفني لفلسطين عبر ٤٠٠٠ سنة، يركز على الذاكرة
        المناهضة للاستعمار والمصادر والشهادات الفلسطينية.
      </p>

      <section className="mt-6 space-y-3">
        <div className="space-x-0 space-y-2 sm:space-y-0 sm:space-x-3 sm:[&>*]:inline-block">
          <a href="/ar/maps" className="rounded border px-3 py-2 text-sm hover:bg-gray-50">
            عرض الأماكن على الخريطة
          </a>
          <a href="/ar/chapters/001-prologue" className="rounded border px-3 py-2 text-sm hover:bg-gray-50">
            قراءة المقدّمة
          </a>
        </div>
      </section>

      {/* Language toggle */}
      <p className="mt-10 text-sm text-gray-600">
        <a className="underline hover:no-underline" href="/">
          ← English
        </a>
      </p>
    </main>
  );
}
