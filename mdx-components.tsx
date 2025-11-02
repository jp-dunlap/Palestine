import * as React from 'react';
import { citeById, shortCiteById } from '@/lib/bibliography';
import { createFootnotesManager } from '@/components/Footnotes';

function Cite({ id, children }: { id?: string; children?: React.ReactNode }) {
  const short = id ? shortCiteById(id) : children ? String(children) : '';
  const full = id ? citeById(id) : short;
  const hasPlaceholder = /TODO/i.test(full) || /\[missing:/.test(full) || /Stub entry/i.test(full);
  return (
    <sup
      style={{ fontSize: '0.75em', lineHeight: 1 }}
      className="align-super"
      aria-label="citation"
      title={hasPlaceholder ? undefined : full}
    >
      [{short}]
    </sup>
  );
}

export function createMdxComponents(locale: 'en' | 'ar' = 'en') {
  const { Footnote, FootnotesSection } = createFootnotesManager(locale);
  return {
    components: {
      Cite,
      Footnote,
    },
    FootnotesSection,
  } as const;
}
