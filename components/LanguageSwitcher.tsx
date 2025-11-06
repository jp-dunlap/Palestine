'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import LocaleLink, { type Locale } from '@/components/LocaleLink';
import { buildLanguageToggleHref } from '@/lib/i18nRoutes';

export default function LanguageSwitcher() {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const { href, label, linkDir, testId, targetLocale } = useMemo(() => {
    const isArabic = pathname === '/ar' || pathname.startsWith('/ar/');
    const targetLocale: Locale = isArabic ? 'en' : 'ar';
    const params = search ? new URLSearchParams(search) : undefined;
    const href = buildLanguageToggleHref(pathname || '/', params, targetLocale);

    return {
      href,
      label: isArabic ? 'English' : 'العربية',
      linkDir: isArabic ? ('ltr' as const) : ('rtl' as const),
      testId: isArabic ? 'language-toggle-en' : 'language-toggle-ar',
      targetLocale,
    };
  }, [pathname, search]);

  const handleClick = useCallback(() => {
    const maxAge = 60 * 60 * 24 * 180; // roughly 180 days
    const secure = process.env.NODE_ENV === 'production';
    const cookieParts = [
      `p2_locale=${encodeURIComponent(targetLocale)}`,
      `Max-Age=${maxAge}`,
      'Path=/',
      'SameSite=Lax',
    ];
    if (secure) {
      cookieParts.push('Secure');
    }
    document.cookie = cookieParts.join('; ');
  }, [targetLocale]);

  return (
    <LocaleLink
      href={href}
      locale={targetLocale}
      className="text-sm font-semibold underline decoration-dotted underline-offset-4 hover:no-underline"
      dir={linkDir}
      data-testid={testId}
      onClick={handleClick}
    >
      {label}
    </LocaleLink>
  );
}
