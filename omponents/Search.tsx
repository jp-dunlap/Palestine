// Minimal, non-functional search UI stub. We'll hook this up once we have a site scaffold.

import type { SearchDoc, SearchResult } from '@/lib/search';

export type SearchProps = {
  docs?: SearchDoc[];
  onSelect?: (doc: SearchDoc) => void;
  placeholder?: string;
};

export default function Search({ docs = [], onSelect, placeholder }: SearchProps) {
  // Placeholder: render a bare input and an empty result list
  // Real implementation will debounce input, query local index, and render results.
  return (
    <div className="w-full max-w-xl">
      <input
        aria-label="Search"
        placeholder={placeholder ?? 'Search chapters, timeline, places…'}
        className="w-full border rounded p-2"
      />
      <ul aria-live="polite" aria-busy="false">
        {/* Results will render here */}
      </ul>
    </div>
  );
}
