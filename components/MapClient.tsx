'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';

type PlaceLite = { id: string; name: string; lat: number; lon: number };

type MapProps = {
  center?: [number, number];  // [lng, lat]
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [[number, number], [number, number]]; // [[west,south],[east,north]]
  places: PlaceLite[];
  className?: string;
  /** Pan/zoom to this point (if provided). */
  focus?: { lat: number; lon: number } | null;
  /** When incremented, re-fit map to include all places. */
  fitTrigger?: number;
};

export default function MapClient({
  center = [35.2, 31.9],
  zoom = 7.5,
  minZoom,
  maxZoom,
  bounds,
  places,
  className,
  focus,
  fitTrigger = 0
}: MapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null); // <- actual Leaflet container
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState('mounted');

  // keep a copy of lat/lon pairs for quick re-fit
  const latLngsRef = useRef<L.LatLngExpression[]>([]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!innerRef.current) return;

      // Load clustering plugin at runtime
      await import('leaflet.markercluster');

      const target = innerRef.current;

      // *** IMPORTANT: if a previous Leaflet map used this element, clear it ***
      if ((target as any)._leaflet_id) {
        try {
          // remove any leftover children/contexts
          target.innerHTML = '';
          // @ts-ignore
          delete (target as any)._leaflet_id;
        } catch {}
      }

      const cLat = center[1];
      const cLng = center[0];

      // Leaflet map (SVG, no animations for dev stability)
      const map = L.map(target, {
        center: [cLat, cLng],
        zoom: zoom ?? 7,
        zoomControl: false,
        worldCopyJump: false,
        inertia: false,
        zoomAnimation: false,
        fadeAnimation: false,
        preferCanvas: false // SVG markers
      });
      if (cancelled) {
        map.remove();
        return;
      }
      mapRef.current = map;

      // Make sure map sizes correctly after first layout
      setTimeout(() => map.invalidateSize(false), 0);

      if (bounds) {
        const [[west, south], [east, north]] = bounds;
        const maxB = L.latLngBounds([south, west], [north, east]);
        map.setMaxBounds(maxB);
        // @ts-ignore
        map.options.maxBoundsViscosity = 1.0;
      }

      // --- Background pane BELOW everything (so it never covers markers) ---
      const bgPaneName = 'bgPane';
      if (!map.getPane(bgPaneName)) {
        map.createPane(bgPaneName);
        const bgPane = map.getPane(bgPaneName)!;
        bgPane.style.zIndex = '100'; // lower than tilePane(200), overlay(400), marker(600)
        bgPane.style.pointerEvents = 'none';
      }

      // Try OSM tiles; if blocked, add a neutral background in bgPane
      let usedFallback = false;
      const useFallback = () => {
        if (usedFallback) return;
        usedFallback = true;
        L.rectangle([[-90, -180], [90, 180]], {
          pane: bgPaneName,
          color: '#f5f5f5',
          weight: 0,
          fillOpacity: 1
        }).addTo(map);
        setStatus('ready (Leaflet — no tiles)');
      };

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      })
        .on('load', () => setStatus('ready (Leaflet + OSM)'))
        .on('tileerror', useFallback)
        .addTo(map);

      const fallbackTimer = window.setTimeout(useFallback, 2000);

      // --- Clustered markers (SVG) ---
      const svgRenderer = L.svg();
      const inBox = (lon: number, lat: number) => lon > 32 && lon < 36 && lat > 29 && lat < 34;

      // plugin augments L at runtime; avoid TS type deps
      const clusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 11,
        animate: false
      });

      const latLngs: L.LatLngExpression[] = [];
      for (const p of places) {
        let lon = p.lon;
        let lat = p.lat;
        if (!inBox(lon, lat) && inBox(lat, lon)) [lon, lat] = [lat, lon];
        if (!Number.isFinite(lon) || !Number.isFinite(lat)) continue;

        const ll: L.LatLngExpression = [lat, lon];
        latLngs.push(ll);

        const marker = L.circleMarker(ll, {
          renderer: svgRenderer,
          radius: 5,
          color: '#111',
          weight: 1,
          fillOpacity: 0.9
        }).bindPopup(
          `<strong>${escapeHtml(p.name)}</strong><br/>${lat.toFixed(3)}, ${lon.toFixed(3)}`
        );

        clusterGroup.addLayer(marker);
      }

      clusterGroup.addTo(map);
      latLngsRef.current = latLngs;

      if (latLngs.length) {
        const b = L.latLngBounds(latLngs);
        map.fitBounds(b, { padding: [40, 40], animate: false });
        if (typeof minZoom === 'number') map.setMinZoom(minZoom);
        if (typeof maxZoom === 'number') map.setMaxZoom(maxZoom);
      }

      // cleanup
      return () => {
        window.clearTimeout(fallbackTimer);
      };
    };

    boot();

    return () => {
      cancelled = true;
      // remove map if present
      const map = mapRef.current;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
      // also clear inner container to drop any leftover layers/panes
      if (innerRef.current) {
        innerRef.current.innerHTML = '';
        // @ts-ignore
        if ((innerRef.current as any)._leaflet_id) delete (innerRef.current as any)._leaflet_id;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, minZoom, maxZoom, bounds, places]);

  // Focus a single point (e.g., from a list click or deep link)
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.setView([focus.lat, focus.lon], Math.max(map.getZoom(), 10), { animate: false });
  }, [focus]);

  // External trigger to re-fit to all points (Reset view)
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const latLngs = latLngsRef.current;
    if (!latLngs.length) return;
    const b = L.latLngBounds(latLngs);
    map.fitBounds(b, { padding: [40, 40], animate: false });
  }, [fitTrigger]);

  return (
    <div
      ref={containerRef}
      className={className ?? 'w-full rounded border'}
      style={{ height: 420, position: 'relative' }}
    >
      {/* Leaflet actually mounts here */}
      <div ref={innerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* status badge */}
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
