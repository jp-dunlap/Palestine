'use client';
import Search from '@/components/Search';
import type { SearchDoc } from '@/lib/loaders.search';

export default function SearchIsland({ docs, locale }: { docs: SearchDoc[]; locale?: 'en' | 'ar' }) {
  const isAr = locale === 'ar';
  return (
    <Search
      docs={docs}
      placeholder={isAr ? 'ابحث' : 'Search'}
      clearLabel={isAr ? 'مسح البحث' : 'Clear search'}
      tagPrefix={isAr ? '/ar/timeline?tags=' : '/timeline?tags='}
    />
  );
}
