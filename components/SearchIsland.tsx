// components/SearchIsland.tsx
'use client';

import Search from './Search';
import type { SearchDoc } from '@/lib/loaders.search';

type Props = {
  docs?: SearchDoc[];
  locale?: 'en' | 'ar';
};

export default function SearchIsland({ docs = [], locale = 'en' }: Props) {
  // docs is always SearchDoc[] and locale is always 'en' | 'ar'
  return <Search docs={docs} locale={locale} />;
}
