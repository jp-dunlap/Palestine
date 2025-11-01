'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

export default function LanguageSwitcher() {
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const { href, label, linkDir } = useMemo(() => {
    const isArabic = pathname === '/ar' || pathname.startsWith('/ar/');
    const params = search ? `?${search}` : '';

    if (isArabic) {
      const withoutPrefix = pathname.replace(/^\/ar(\b|\/)/, '/');
      const target = withoutPrefix === '' ? '/' : withoutPrefix;
      return {
        href: `${target}${params}` || '/',
        label: 'English',
        linkDir: 'ltr' as const,
      };
    }

    const suffix = pathname === '/' ? '' : pathname;
    return {
      href: `/ar${suffix}${params}`,
      label: 'العربية',
      linkDir: 'rtl' as const,
    };
  }, [pathname, search]);

  return (
    <Link
      href={href}
      className="text-sm font-semibold underline decoration-dotted underline-offset-4 hover:no-underline"
      dir={linkDir}
    >
      {label}
    </Link>
  );
}
