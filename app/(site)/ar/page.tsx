import '../../globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'فلسطين',
  description: 'تاريخ عام وفني لفلسطين'
};

export default function Page() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">فلسطين</h1>
      <p className="mt-2 text-base text-gray-700">
        هذا هو المسار العربي. سنضيف فصولاً وواجهة بالعربية لاحقًا.
      </p>

      <p className="mt-4">
        <a className="underline hover:no-underline" href="/ar/chapters/001-prologue">
          ← قراءة المقدّمة
        </a>
      </p>
    </main>
  );
}
