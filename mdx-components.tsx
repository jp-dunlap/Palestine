import * as React from 'react';
import { citeById, shortCiteById } from '@/lib/bibliography';

function Cite({ id, children }: { id?: string; children?: React.ReactNode }) {
  const short = id ? shortCiteById(id) : (children ? String(children) : '');
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

function Footnote({ children }: { children: React.ReactNode }) {
  const text = typeof children === 'string' ? children : undefined;
  return (
    <sup
      style={{ fontSize: '0.75em', lineHeight: 1 }}
      className="align-super"
      aria-label="footnote"
      title={text}
    >
      †
    </sup>
  );
}

export const mdxComponents = {
  Cite,
  Footnote,
};
