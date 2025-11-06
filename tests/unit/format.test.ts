import { describe, expect, it } from 'vitest';

import { formatDate, formatNumber } from '@/lib/format';

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
});
