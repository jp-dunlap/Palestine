import { describe, expect, it } from 'vitest';
import robots from '@/app/robots';

describe('robots.txt configuration', () => {
  it('disallows admin surfaces and omits legacy cms api', () => {
    const result = robots();
    const rules = result.rules ?? [];
    const disallowEntries = rules
      .map((rule: { disallow?: string | string[] }) =>
        Array.isArray(rule.disallow)
          ? rule.disallow
          : rule.disallow
            ? [rule.disallow]
            : []
      )
      .flat();

    expect(disallowEntries).toContain('/admin');
    expect(disallowEntries).toContain('/api/admin');
    expect(disallowEntries).not.toContain('/api/cms');
  });
});
