// mdx-components.tsx
import * as React from 'react';
import { citeById, shortCiteById } from '@/lib/bibliography';

/**
 * <Cite id="icj-2004-wall-opinion" />
 * Renders a compact superscript like [ICJ 2004] with the full citation in the tooltip.
 */
function Cite({ id, children }: { id?: string; children?: React.ReactNode }) {
  const short = id ? shortCiteById(id) : (children ? String(children) : '');
  const full = id ? citeById(id) : short;
  return (
    <sup
      style={{ fontSize: '0.75em', lineHeight: 1 }}
      className="align-super"
      aria-label="citation"
      title={full}
    >
      [{short}]
    </sup>
  );
}

/**
 * <Footnote>UNRWA reported …</Footnote>
 * Minimal inline footnote mark; full text exposed via tooltip.
 */
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
