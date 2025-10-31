// mdx-components.tsx
import * as React from 'react';
import { citeById } from '@/lib/bibliography';

/**
 * Usage in MDX:
 *   Palestine is a living archive <Cite id="icj-2004-wall-opinion" /> that refuses imperial erasure.
 */
function Cite({ id, children }: { id?: string; children?: React.ReactNode }) {
  const text = id ? citeById(id) : (children ? String(children) : '');
  return (
    <sup
      style={{ fontSize: '0.75em', lineHeight: 1 }}
      className="align-super"
      aria-label="citation"
      title={text}
    >
      [{text}]
    </sup>
  );
}

/**
 * Lightweight inline footnote. Example:
 *   ... the camp was bulldozed.<Footnote>UNRWA report, 2002.</Footnote>
 */
function Footnote({ children }: { children: React.ReactNode }) {
  return (
    <sup
      style={{ fontSize: '0.75em', lineHeight: 1 }}
      className="align-super"
      aria-label="footnote"
      title={typeof children === 'string' ? children : undefined}
    >
      †
    </sup>
  );
}

export const mdxComponents = {
  Cite,
  Footnote,
};
