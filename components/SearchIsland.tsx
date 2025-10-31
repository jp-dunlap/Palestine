// components/SearchIsland.tsx
'use client';

import { useEffect, useState } from 'react';
import Search, { type SearchDoc } from './Search';

type Props = {
  docs: SearchDoc[];
  locale?: 'en' | 'ar';
};

export default function SearchIsland({ docs, locale = 'en' }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Search docs={docs} locale={locale} />;
}
