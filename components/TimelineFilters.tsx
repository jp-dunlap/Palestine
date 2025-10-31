'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Era } from '@/lib/types';
import * as React from 'react';

export default function TimelineFilters({ eras }: { eras: Era[] }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [q, setQ] = React.useState(sp.get('q') ?? '');
  const selectedEras = new Set((sp.get('eras') ?? '').split(',').filter(Boolean));

  function update(param: string, value: string) {
    const params = new URLSearchParams(sp.toString());
    if (value) params.set(param, value);
    else params.delete(param);
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  function toggleEra(id: string) {
    const next = new Set(selectedEras);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    update('eras', Array.from(next).join(','));
  }

  return (
    <div className="mb-6 space-y-3">
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          update('q', e.target.value);
        }}
        placeholder="Search timeline…"
        className="w-full rounded border px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-3">
        {eras.map((e) => (
          <label key={e.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedEras.has(e.id)}
              onChange={() => toggleEra(e.id)}
            />
            <span>{e.title}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
