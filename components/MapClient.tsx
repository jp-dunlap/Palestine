'use client';

import { useEffect, useRef, useState } from 'react';
import * as L from 'leaflet';
import type { Place } from '@/lib/types';

type MapProps = {
  center?: [number, number];
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  bounds?: [[number, number], [number, number]];
  places: Place[];
  className?: string;
  focus?: { lat: number; lon: number } | null;
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
  const innerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [status, setStatus] = useState('mounted');
  const latLngsRef = useRef<L.LatLngExpression[]>([]);

  useEffect(() => {
    let cancelled = false;

    const boot = async () => {
      if (!innerRef.current) return;
      await import('leaflet.markercluster');

      const target = innerRef.current;
      if ((target as any)._leaflet_id) {
        try {
          target.innerHTML = '';
          delete (target as any)._leaflet_id;
        } catch {}
      }

      const cLat = center[1];
      const cLng = center[0];
      const map = L.map(target, {
        center: [cLat, cLng],
        zoom: zoom ?? 7,
        zoomControl: true,
        scrollWheelZoom: false,
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
      setTimeout(() => map.invalidateSize(false), 0);

      if (bounds) {
        const [[west, south], [east, north]] = bounds;
        const maxB = L.latLngBounds([south, west], [north, east]);
        map.setMaxBounds(maxB);
        // @ts-ignore
        map.options.maxBoundsViscosity = 1.0;
      }

      const bgPaneName = 'bgPane';
      if (!map.getPane(bgPaneName)) {
        map.createPane(bgPaneName);
        const bgPane = map.getPane(bgPaneName)!;
        bgPane.style.zIndex = '100';
        bgPane.style.pointerEvents = 'none';
      }

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

      const svgRenderer = L.svg();
      const inBox = (lon: number, lat: number) =>
        lon > 32 && lon < 36 && lat > 29 && lat < 34;

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

      if (latLngs.length) {
        const b = L.latLngBounds(latLngs);
        map.fitBounds(b, { padding: [40, 40], animate: false });
        if (typeof minZoom === 'number') map.setMinZoom(minZoom);
        if (typeof maxZoom === 'number') map.setMaxZoom(maxZoom);
      }

      return () => {
        window.clearTimeout(fallbackTimer);
      };
    };

    boot();

    return () => {
      const map = mapRef.current;
      if (map) {
        map.remove();
        mapRef.current = null;
      }
      if (innerRef.current) {
        innerRef.current.innerHTML = '';
        // @ts-ignore
        if ((innerRef.current as any)._leaflet_id) {
          // @ts-ignore
          delete (innerRef.current as any)._leaflet_id;
        }
      }
    };
  }, [center, zoom, minZoom, maxZoom, bounds, places]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focus) return;
    map.setView([focus.lat, focus.lon], Math.max(map.getZoom(), 10), { animate: false });
  }, [focus]);

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
      <div ref={innerRef} style={{ position: 'absolute', inset: 0 }} />
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
        aria-live="polite"
        role="status"
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
