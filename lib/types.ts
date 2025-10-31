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

// ---- Timeline types ----
export type Era = {
  id: string;             // e.g., "foundations"
  title: string;          // display name
  start: number;          // year (negative = BCE)
  end: number | null;     // null = open
  color?: string;         // optional accent color for UI lanes
};

export type TimelineEvent = {
  id: string;             // stable id, usually the filename (without .yml)
  title: string;
  start: number;
  end: number | null;     // null for instant events
  places: string[];       // place ids from gazetteer
  sources: string[];      // CSL-JSON ids or URLs
  summary: string;        // short, plain-text summary
  tags: string[];         // topical tags
  certainty: 'low' | 'medium' | 'high';
  era?: string;           // optional era id
};

// ---- Map / Places ----
export type PlaceKind = 'city' | 'port_city' | 'region' | 'site' | 'river' | string;

export type Place = {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind?: PlaceKind;
  alt_names?: string[];
};

export type MapConfig = {
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]];
};
