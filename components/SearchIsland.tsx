// components/SearchIsland.tsx
'use client';

import Search from './Search';

type Props = {
  docs: React.ComponentProps<typeof Search>['docs'];
  locale?: React.ComponentProps<typeof Search>['locale'];
};

export default function SearchIsland({ docs, locale }: Props) {
  return <Search docs={docs} locale={locale} />;
}
