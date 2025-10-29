// Placeholder Map component. We'll wire MapLibre GL later.
// Keeping it typed now prevents churn when we scaffold Next.js.

export type MapProps = {
  styleUrl?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [[number, number], [number, number]]; // [[west,south],[east,north]]
  className?: string;
};

export default function Map(_props: MapProps) {
  // TODO: Implement MapLibre map with RTL-aware labels and gazetteer markers.
  return null;
}
