'use client';

import { useEffect, useState } from 'react';

type Props = {
  className?: string;
  labelEn?: string;
  labelAr?: string;
};

function toggleLocale(pathname: string): string {
  if (!pathname.startsWith('/ar')) {
    return pathname === '/' ? '/ar' : `/ar${pathname}`;
  }
  const rest = pathname.slice(3) || '/';
  return rest;
}

export default function LanguageSwitcher({ className, labelEn = 'English', labelAr = 'العربية' }: Props) {
  const [href, setHref] = useState('/ar');
  const [label, setLabel] = useState(labelAr);

  useEffect(() => {
    const { pathname, search } = window.location;
    const target = toggleLocale(pathname) + (search || '');
    setHref(target);
    setLabel(pathname.startsWith('/ar') ? labelEn : labelAr);
  }, [labelAr, labelEn]);

  return (
    <a href={href} className={className}>
      {label}
    </a>
  );
}
