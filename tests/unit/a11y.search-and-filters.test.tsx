import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SearchClient from '@/components/SearchClient';
import TimelineFilters from '@/components/TimelineFilters';
import type { Era } from '@/lib/types';

const searchParamsState = { value: '' };

vi.mock('next/navigation', () => ({
  useSearchParams: () => {
    const params = new URLSearchParams(searchParamsState.value);
    return {
      get: params.get.bind(params),
      getAll: params.getAll.bind(params),
      toString: () => params.toString(),
    };
  },
  usePathname: () => '/timeline',
  useRouter: () => ({ replace: vi.fn() }),
}));

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

describe('search and filter accessibility', () => {
  beforeEach(() => {
    searchParamsState.value = '';
  });

  it('renders search input with a programmatically associated label', () => {
    const markup = renderToStaticMarkup(<SearchClient locale="en" />);
    const labelMatch = markup.match(/<label[^>]*for="([^"]+)"[^>]*>\s*Search\s*<\/label>/i);
    expect(labelMatch).not.toBeNull();
    const inputId = labelMatch![1];
    const inputPattern = new RegExp(`<input[^>]*id="${escapeRegExp(inputId)}"`, 'i');
    expect(inputPattern.test(markup)).toBe(true);
  });

  it('exposes filter chips with aria-pressed and descriptive accessible names', () => {
    const eras: Era[] = [
      { id: 'modern', title: 'Modern era', start: 1900, end: null },
    ];

    const initialMarkup = renderToStaticMarkup(
      <TimelineFilters eras={eras} locale="en" resultCount={0} />
    );

    expect(
      /<button[^>]*aria-pressed="false"[^>]*aria-label="Era: Modern era — not selected"/i.test(
        initialMarkup
      )
    ).toBe(true);

    searchParamsState.value = 'eras=modern';
    const selectedMarkup = renderToStaticMarkup(
      <TimelineFilters eras={eras} locale="en" resultCount={0} />
    );

    expect(
      /<button[^>]*aria-pressed="true"[^>]*aria-label="Era: Modern era — selected"/i.test(
        selectedMarkup
      )
    ).toBe(true);
  });
});
