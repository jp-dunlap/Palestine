'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
// types come from @/lib/types; but we only need lat/lon/name/id at runtime
import type { Place } from '@/lib/types';

type MapProps = {
  /** [lng, lat] */
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  /** [[west,south],[east,north]] */
  bounds?: [[number, number], [number, number]];
  places: Place[];
  className?: string;

  /** Pan/zoom to this point (e.g., from list click or deep link). */
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
  // Actual Leaflet attaches to this inner div (avoids double-initialization)
  const innerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState('mounted');
  const latLngsRef = useRef<L.LatLngExpression[]>([]);

  // Create / update map
  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!innerRef.current) return;

      // Load clustering at runtime (plugin augments L)
      await import('leaflet.markercluster');

      const target = innerRef.current;

      // If Leaflet had used this element before, reset it
      if ((target as any)._leaflet_id) {
        try {
          target.innerHTML = '';
          // @ts-ignore
          delete (target as any)._leaflet_id;
        } catch {
          /* no-op */
        }
      }

      const cLat = center[1];
      const cLng = center[0];

      // Build map (SVG renderer, calm animations for stability)
      const map = L.map(target, {
        center: [cLat, cLng],
        zoom: zoom ?? 7,
        zoomControl: true,
        scrollWheelZoom: false, // better page scroll on mobile/trackpads
        inertia: true,
        zoomAnimation: false,
        fadeAnimation: false,
        preferCanvas: false
      });
      if (cancelled) {
        map.remove();
        return;
      }
      mapRef.current = map;

      // Ensure proper sizing after first layout
      setTimeout(() => map.invalidateSize(false), 0);

      // Constrain world view if bounds are provided
      if (bounds) {
        const [[west, south], [east, north]] = bounds;
        const maxB = L.latLngBounds([south, west], [north, east]);
        map.setMaxBounds(maxB);
        // @ts-ignore - viscosity exists on options
        map.options.maxBoundsViscosity = 1.0;
      }

      // Background pane sits below tiles/markers
      const bgPaneName = 'bgPane';
      if (!map.getPane(bgPaneName)) {
        map.createPane(bgPaneName);
        const bgPane = map.getPane(bgPaneName)!;
        bgPane.style.zIndex = '100'; // tilePane(200), overlay(400), marker(600)
        bgPane.style.pointerEvents = 'none';
      }

      // Tiles (env-driven with safe defaults)
      const tileUrl =
        process.env.NEXT_PUBLIC_MAP_TILE_URL ??
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      const tileAttrib =
        process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '© OpenStreetMap contributors';

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

      L.tileLayer(tileUrl, { attribution: tileAttrib })
        .on('load', () => setStatus('ready (Leaflet + tiles)'))
        .on('tileerror', useFallback)
        .addTo(map);

      const fallbackTimer = window.setTimeout(useFallback, 2000);

      // Clustered markers (SVG)
      const svgRenderer = L.svg();
      const inBox = (lon: number, lat: number) =>
        lon > 32 && lon < 36 && lat > 29 && lat < 34;

      // Use any to avoid hard plugin typings coupling
      const clusterGroup: L.MarkerClusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        spiderfyOnMaxZoom: false,
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 11,
        animate: false
      });

      const latLngs: L.LatLngExpression[] = [];
      for (const p of places) {
        let lon = Number(p.lon);
        let lat = Number(p.lat);
        // Heuristic: swap if user accidentally inverted coords
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
            `<strong><a href="/places/${encodeURIComponent(p.id)}" target="_self" rel="noopener noreferrer">${escapeHtml(p.name)}</a></strong><br/>${lat.toFixed(3)}, ${lon.toFixed(3)}`
        );

        clusterGroup.addLayer(marker);
      }

      clusterGroup.addTo(map);
      latLngsRef.current = latLngs;

      // Initial fit + zoom constraints
      if (latLngs.length) {
        const b = L.latLngBounds(latLngs);
        map.fitBounds(b, { padding: [40, 40], animate: false });
        if (typeof minZoom === 'number') map.setMinZoom(minZoom);
        if (typeof maxZoom === 'number') map.setMaxZoom(maxZoom);
      }

      // Cleanup timer on effect teardown
      return () => {
        window.clearTimeout(fallbackTimer);
      };
    };

    boot();

    return () => {
      // tear down map
      const map = mapRef.current;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
      // drop any leftover Leaflet state on the inner container
      if (innerRef.current) {
        innerRef.current.innerHTML = '';
        // @ts-ignore
        if ((innerRef.current as any)._leaflet_id) {
          // @ts-ignore
          delete (innerRef.current as any)._leaflet_id;
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center, zoom, minZoom, maxZoom, bounds, places]);

  // Focus a single point (from list click or deep link)
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
      className={className ?? 'w-full rounded border'}
      style={{ height: 420, position: 'relative' }}
    >
      {/* Leaflet mounts here */}
      <div ref={innerRef} style={{ position: 'absolute', inset: 0 }} />

      {/* status badge (debug-friendly, harmless in prod) */}
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
