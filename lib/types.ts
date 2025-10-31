// lib/types.ts

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
  id: string;        // e.g., "foundations"
  title: string;     // display name
  start: number;     // year (negative = BCE)
  end: number | null;// null = open
  color?: string;    // optional accent for UI
};

export type TimelineEvent = {
  id: string;                          // stable id (usually filename without .yml)
  title: string;
  start: number;
  end: number | null;                  // null for instant events
  places: string[];                    // gazetteer ids
  sources: string[];                   // CSL-JSON ids or URLs
  summary: string;                     // short, plain-text summary
  tags: string[];                      // topical tags
  certainty: 'low' | 'medium' | 'high';
  era?: string;                        // optional era id
};
