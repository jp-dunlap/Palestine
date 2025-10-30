'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';

type PlaceLite = { id: string; name: string; lat: number; lon: number };

export type MapProps = {
  // You can pass either a JSON style object or a URL.
  styleJson?: any;
  styleUrl?: string;
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [[number, number], [number, number]];
  places: PlaceLite[];
  className?: string;
};

export default function MapClient({
  styleJson,
  styleUrl,
  center = [35.2, 31.9],
  zoom = 7.5,
  minZoom,
  maxZoom,
  bounds,
  places,
  className
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const fittedRef = useRef(false);
  const [status, setStatus] = useState<string>('mounted');

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const style = styleJson ?? styleUrl;
    setStatus(`init → style:${typeof style === 'string' ? style : '[inline JSON]'}`);

    try {
      const map = new maplibregl.Map({
        container: containerRef.current,
        style, // ← object or URL
        center,
        zoom,
        minZoom,
        maxZoom,
        renderWorldCopies: false,
        maxBounds: bounds
      });

      map.on('error', (e) => {
        // @ts-ignore
        const msg = e?.error?.message || String(e);
        console.error('MapLibre error:', e);
        setStatus(`error: ${msg}`);
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
      map.dragRotate.disable();
      // @ts-ignore
      map.touchZoomRotate?.disableRotation?.();

      map.once('load', () => {
        setStatus('style loaded → adding markers');

        // Palestine-ish sanity box
        const inBox = (lon: number, lat: number) => lon > 32 && lon < 36 && lat > 29 && lat < 34;

        let minLon = Infinity, minLat = Infinity, maxLon = -Infinity, maxLat = -Infinity;

        for (const p of places) {
          let lon = p.lon;
          let lat = p.lat;
          // auto-correct obvious [lat, lon] swaps
          if (!inBox(lon, lat) && inBox(lat, lon)) [lon, lat] = [lat, lon];
          if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

          minLon = Math.min(minLon, lon);
          minLat = Math.min(minLat, lat);
          maxLon = Math.max(maxLon, lon);
          maxLat = Math.max(maxLat, lat);

          new maplibregl.Marker()
            .setLngLat([lon, lat])
            .setPopup(
              new maplibregl.Popup({ closeButton: false }).setHTML(
                `<strong>${escapeHtml(p.name)}</strong><br/>${lat.toFixed(3)}, ${lon.toFixed(3)}`
              )
            )
            .addTo(map);
        }

        if (!fittedRef.current &&
            isFinite(minLon) && isFinite(minLat) && isFinite(maxLon) && isFinite(maxLat)) {
          fittedRef.current = true;
          map.fitBounds([[minLon, minLat], [maxLon, maxLat]], { padding: 40, maxZoom: 10 });
        }

        setStatus('ready');
      });

      mapRef.current = map;
      return () => map.remove();
    } catch (err: any) {
      console.error('Map init failed:', err);
      setStatus(`init failed: ${err?.message || String(err)}`);
    }
  }, [styleJson, styleUrl, center, zoom, minZoom, maxZoom, bounds, places]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'w-full rounded border'}
      style={{ height: 420, position: 'relative' }}
    >
      {/* On-page status so we can see what’s happening without DevTools */}
      <div
        style={{
          position: 'absolute',
          top: 6,
          left: 8,
          zIndex: 10,
          background: 'rgba(255,255,255,0.9)',
          padding: '2px 6px',
          fontSize: 12,
          borderRadius: 4,
          pointerEvents: 'none'
        }}
      >
        map: {status}
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
