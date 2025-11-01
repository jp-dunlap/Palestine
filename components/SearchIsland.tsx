'use client';
import Search from '@/components/Search';
import type { SearchDoc } from '@/lib/loaders.search';

type Props = { docs: SearchDoc[] };

export default function SearchIsland({ docs }: Props) {
  return <Search docs={docs} />;
}
