'use client';

import { usePathname, useSearchParams } from 'next/navigation';

const BASE = process.env.NEXT_PUBLIC_SITE_URL || '';

export default function LanguageSwitcher({ locale }: { locale: 'en' | 'ar' }) {
  const pathname = usePathname() || '/';
  const search = useSearchParams();
  const query = search?.toString() ? `?${search!.toString()}` : '';

  const opposite = locale === 'ar' ? 'en' : 'ar';
  const path =
    opposite === 'ar'
      ? (pathname.startsWith('/ar') ? pathname : `/ar${pathname}`) // ensure ar prefix
      : (pathname.startsWith('/ar') ? pathname.replace(/^\/ar(\/|$)/, '/') : pathname);

  // Build absolute URL to avoid relative edge cases on Vercel runtimes
  const href = BASE ? new URL(`${path}${query}`, BASE).toString() : `${path}${query}`;

  return (
    <a
      href={href}
      className="inline-flex items-center text-sm underline hover:no-underline"
      aria-label={opposite === 'ar' ? 'العربية' : 'English'}
    >
      {opposite === 'ar' ? 'العربية' : 'English'}
    </a>
  );
}
