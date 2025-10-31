// components/SearchIsland.tsx
'use client';

import { useEffect, useState } from 'react';
import Search from './Search';
import type React from 'react';

/**
 * Accept the exact docs prop type that Search expects, without importing a custom Doc type.
 * This avoids "no exported member 'Doc'" and keeps us aligned with Search's signature.
 */
type Props = { docs: React.ComponentProps<typeof Search>['docs'] };

export default function SearchIsland({ docs }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null; // SSR → nothing; CSR → render Search. Prevents hydration mismatches.

  return <Search docs={docs} />;
}
