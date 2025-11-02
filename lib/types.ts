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
  date: string;
  sources: Array<{ id?: string; url?: string }>;
  places?: string[];
  title_ar?: string;
  summary_ar?: string;
  tags_ar?: string[];
};

export type LessonFrontmatter = {
  title: string;
  slug: string;
  summary?: string;
  tags?: string[];
  updated?: string;
};

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

export type Era = {
  id: string;
  title: string;
  title_ar?: string;
  start: number;
  end: number | null;
  color?: string;
};

export type TimelineEvent = {
  id: string;
  title: string;
  title_ar?: string;
  start: number;
  end: number | null;
  places: string[];
  sources: string[];
  summary: string;
  summary_ar?: string;
  tags: string[];
  tags_ar?: string[];
  certainty: 'low' | 'medium' | 'high';
  era?: string;
};
