import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SourceLink from '@/components/SourceLink';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('SourceLink', () => {
  it('renders an anchor with descriptive text in development', () => {
    vi.stubEnv('NODE_ENV', 'development');
    const markup = renderToStaticMarkup(
      <SourceLink href="https://example.com/report">Detailed report on Gaza (2024)</SourceLink>
    );
    expect(markup).toContain('<a');
    expect(markup).toContain('Detailed report on Gaza (2024)');
  });

  it('throws when children are missing', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => renderToStaticMarkup(<SourceLink href="https://example.com" />)).toThrowError(
      /requires descriptive children/i
    );
  });

  it('rejects generic labels', () => {
    vi.stubEnv('NODE_ENV', 'development');
    expect(() => renderToStaticMarkup(
      <SourceLink href="https://example.com">link</SourceLink>
    )).toThrowError(/too generic/);
  });

  it('allows generic labels in production builds', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() => renderToStaticMarkup(
      <SourceLink href="https://example.com">link</SourceLink>
    )).not.toThrow();
  });
});
