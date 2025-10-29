// Shared types for content, data, and future components

export type CSL = {
  id: string;
  type: string;
  title?: string;
  author?: { family: string; given?: string }[];
  issued?: { 'date-parts': number[][] };
  URL?: string;
  authority?: string;
  publisher?: string;
  'publisher-place'?: string;
  language?: string;
  note?: string;
};

export type ChapterFrontmatter = {
  title: string;
  slug: string;
  era: string;
  authors: string[];
  language: 'en' | 'ar';
  summary: string;
  tags: string[];
  date: string; // YYYY-MM-DD
  sources: Array<{
