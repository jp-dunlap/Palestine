// app/(site)/layout.tsx
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

/**
 * Segment layout for (site).
 * NOTE: Do not render <html> or <body> here; the root layout handles that.
 */
export default function SiteSegmentLayout({ children }: { children: ReactNode }) {
  return (
    <div data-locale="en" className="min-h-screen bg-white text-gray-900">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl justify-end rtl:justify-start px-4 py-3">
          <Suspense fallback={<span className="text-sm text-gray-400">…</span>}>
            <LanguageSwitcher />
          </Suspense>
        </div>
      </header>
      <div>{children}</div>
    </div>
  );
}
