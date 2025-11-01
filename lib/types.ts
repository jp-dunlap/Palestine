// lib/types.ts

// ---------- Sources (CSL-JSON) ----------
export type CSL = {
  id: string;
  type: string;
  title?: string;
  author?: { family: string; given?: string }[];
  issued?: { 'date-parts': number[][] }; // e.g., [[2004]]
  URL?: string;
  authority?: string;
  publisher?: string;
  'publisher-place'?: string;
  language?: string;
  note?: string;
};

// ---------- Chapters (MDX frontmatter) ----------
export type ChapterFrontmatter = {
  title: string;
  slug: string;                       // kebab-case
  era: string;                        // must match data/eras.yml
  authors: string[];
  language: 'en' | 'ar';
  summary: string;
  tags: string[];
  date: string;                       // YYYY-MM-DD
  sources: Array<{ id?: string; url?: string }>;
  places?: string[];                  // gazetteer ids/names
  title_ar?: string;
  summary_ar?: string;
  tags_ar?: string[];
};

// ---------- Places & Map ----------
export type PlaceKind =
  | 'city'
  | 'port_city'
  | 'region'
  | 'site'
  | 'river'
  | string;

export type Place = {
  id: string;
  name: string;
  name_ar?: string;
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

// ---------- Timeline ----------
export type Era = {
  id: string;         // e.g., "foundations"
  title: string;
  title_ar?: string;
  start: number;      // negative = BCE
  end: number | null; // null = open
  color?: string;
};

export type TimelineEvent = {
  id: string;                          // usually filename without .yml
  title: string;
  title_ar?: string;
  start: number;
  end: number | null;                  // null for instant events
  places: string[];                    // gazetteer ids
  sources: string[];                   // CSL-JSON ids or URLs
  summary: string;
  summary_ar?: string;
  tags: string[];
  tags_ar?: string[];
  certainty: 'low' | 'medium' | 'high';
  era?: string;                        // era id
};
