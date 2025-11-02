'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

export default function LanguageSwitcher() {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const { href, label, linkDir, testId } = useMemo(() => {
    const isArabic = pathname === '/ar' || pathname.startsWith('/ar/');
    const targetLocale = isArabic ? 'en' : 'ar';
    const params = search ? new URLSearchParams(search) : undefined;
    const href = buildLanguageToggleHref(pathname || '/', params, targetLocale);

    return {
      href,
      label: isArabic ? 'English' : 'العربية',
      linkDir: isArabic ? ('ltr' as const) : ('rtl' as const),
      testId: isArabic ? 'language-toggle-en' : 'language-toggle-ar',
    };
  }, [pathname, search]);

  return (
    <Link
      href={href}
      className="text-sm font-semibold underline decoration-dotted underline-offset-4 hover:no-underline"
      dir={linkDir}
      data-testid={testId}
    >
      {label}
    </Link>
  );
}
