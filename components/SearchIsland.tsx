// components/SearchIsland.tsx
'use client';

import { useEffect, useState } from 'react';
import Search from './Search';

// Keep types aligned with the Search component’s props
type Props = { docs: React.ComponentProps<typeof Search>['docs'] };

export default function SearchIsland({ docs }: Props) {
  // Client-only mount to avoid any SSR/CSR ordering drift
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return <Search docs={docs} />;
}
