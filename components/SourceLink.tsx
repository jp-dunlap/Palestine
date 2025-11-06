import React, { type AnchorHTMLAttributes, type ReactNode } from 'react';

const GENERIC_PATTERNS = [/^link$/i, /^click here$/i, /^source$/i];

function extractText(node: ReactNode): string {
  if (node == null || typeof node === 'boolean') {
    return '';
  }
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }
  if (Array.isArray(node)) {
    return node.map(child => extractText(child)).join('');
  }
  if (typeof node === 'object' && 'props' in (node as any)) {
    return extractText((node as any).props?.children);
  }
  return '';
}

export type SourceLinkProps = AnchorHTMLAttributes<HTMLAnchorElement>;

export default function SourceLink({ children, ...rest }: SourceLinkProps) {
  if (process.env.NODE_ENV !== 'production') {
    const text = extractText(children).trim();
    if (!text) {
      throw new Error('SourceLink requires descriptive children text.');
    }
    if (GENERIC_PATTERNS.some(pattern => pattern.test(text))) {
      throw new Error(`SourceLink children "${text}" are too generic; provide descriptive text.`);
    }
  }

  return (
    <a {...rest}>
      {children}
    </a>
  );
}
