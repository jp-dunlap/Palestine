import { describe, expect, it } from 'vitest';

import { formatDate, formatNumber, formatYear } from '@/lib/format';

describe('format helpers', () => {
  it('uses Eastern Arabic numerals when formatting numbers for Arabic', () => {
    expect(formatNumber(1234, 'ar')).toBe('١٬٢٣٤');
  });

  it('respects locale when formatting dates', () => {
    const sampleDate = new Date(Date.UTC(2024, 0, 15, 0, 0, 0));
    const english = formatDate(sampleDate, 'en', { timeZone: 'UTC' });
    const arabic = formatDate(sampleDate, 'ar', { timeZone: 'UTC' });

    expect(english).toMatch(/2024/);
    expect(arabic).toMatch(/[٠-٩]/);
  });

  it('omits grouping separators when formatting years', () => {
    expect(formatYear(1993, 'en')).toBe('1993');
    expect(formatYear(1993, 'ar')).toBe('١٩٩٣');
    expect(formatYear(-1993, 'ar')).toBe('١٩٩٣ ق.م.');
  });

  it('returns unknown label when provided for missing years', () => {
    expect(formatYear(null, 'en', { unknownLabel: 'Unknown' })).toBe('Unknown');
    expect(formatYear(undefined, 'ar', { unknownLabel: 'غير معروف' })).toBe('غير معروف');
  });
});
