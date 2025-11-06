import { describe, expect, it } from 'vitest';
import { NextRequest } from 'next/server';

import { middleware } from '@/middleware';

function createRequest(path: string, cookie?: string) {
  const url = new URL(path, 'https://example.com');
  const headers = cookie ? new Headers({ cookie }) : undefined;
  return new NextRequest(url, { headers });
}

describe('middleware locale cookie handling', () => {
  it('rewrites / to the arabic locale when cookie is ar', () => {
    const request = createRequest('/', 'p2_locale=ar');
    const response = middleware(request);
    expect(response?.headers.get('x-middleware-rewrite')).toBe('https://example.com/ar');
  });

  it('rewrites / to /en when cookie is en', () => {
    const request = createRequest('/', 'p2_locale=en');
    const response = middleware(request);
    expect(response?.headers.get('x-middleware-rewrite')).toBe('https://example.com/en');
  });

  it('defaults to /en when cookie is missing or invalid', () => {
    const missingCookieReq = createRequest('/');
    const missingResponse = middleware(missingCookieReq);
    expect(missingResponse?.headers.get('x-middleware-rewrite')).toBe('https://example.com/en');

    const invalidReq = createRequest('/', 'p2_locale=fr');
    const invalidResponse = middleware(invalidReq);
    expect(invalidResponse?.headers.get('x-middleware-rewrite')).toBe('https://example.com/en');
  });

  it('does not rewrite non-root paths', () => {
    const request = createRequest('/timeline');
    const response = middleware(request);
    expect(response?.headers.get('x-middleware-rewrite')).toBeNull();
  });
});
