import { describe, expect, it } from 'vitest';
import {
  composeBookmarkAnnouncement,
  composeSearchFilterAnnouncement,
  composeSearchQueryAnnouncement,
  composeTimelineChipAnnouncement,
  composeTimelineLogicAnnouncement,
} from '@/lib/a11y-announcements';

describe('a11y live region messages', () => {
  it('describes search filter updates in English', () => {
    const message = composeSearchFilterAnnouncement(['Place'], {
      joiner: ', ',
      singularWord: 'filter',
      pluralWord: 'filters',
      resultCountText: '5 results',
    });
    expect(message).toBe('Place filter, 5 results');

    const multi = composeSearchFilterAnnouncement(['Chapter', 'Place'], {
      joiner: ', ',
      singularWord: 'filter',
      pluralWord: 'filters',
      resultCountText: '2 results',
    });
    expect(multi).toBe('Chapter, Place filters, 2 results');
  });

  it('describes search filter updates in Arabic with localized joiner', () => {
    const message = composeSearchFilterAnnouncement(['الأماكن', 'الأحداث'], {
      joiner: '، ',
      singularWord: 'مرشح',
      pluralWord: 'مرشحات',
      resultCountText: '٣ نتائج',
      resultSeparator: '، ',
    });
    expect(message).toBe('الأماكن، الأحداث مرشحات، ٣ نتائج');
  });

  it('announces search query changes', () => {
    const active = composeSearchQueryAnnouncement('freedom', {
      describeQuery: (value) => `Search for “${value}”`,
      clearedMessage: 'Search cleared',
      resultCountText: '0 results',
    });
    expect(active).toBe('Search for “freedom”, 0 results');

    const cleared = composeSearchQueryAnnouncement('', {
      describeQuery: (value) => `Search for “${value}”`,
      clearedMessage: 'Search cleared',
      resultCountText: '12 results',
    });
    expect(cleared).toBe('Search cleared, 12 results');
  });

  it('announces timeline chip and logic changes', () => {
    const chip = composeTimelineChipAnnouncement('Nakba', 'selected', 'Showing 5 events');
    expect(chip).toBe('Nakba — selected, Showing 5 events');

    const logic = composeTimelineLogicAnnouncement('Match all eras (AND)', 'Showing 3 events');
    expect(logic).toBe('Match all eras (AND), Showing 3 events');
  });

  it('announces bookmark actions with optional result summaries', () => {
    const withSummary = composeBookmarkAnnouncement('Saved filter set “Liberation map”', 'Showing 7 events');
    expect(withSummary).toBe('Saved filter set “Liberation map”, Showing 7 events');

    const withoutSummary = composeBookmarkAnnouncement('Copied link');
    expect(withoutSummary).toBe('Copied link');
  });
});
