'use client';

import { useEffect, useState } from 'react';
import Search, { type Doc } from './Search';

type Props = { docs: Doc[] };

/** Client-only mount gate to avoid SSR/CSR mismatch for the Search UI. */
export default function SearchIsland({ docs }: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <Search docs={docs} />;
}
