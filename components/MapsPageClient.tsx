'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import MapClient from './MapClient';

type Place = {
  id: string;
  name: string;
  name_ar?: string;
  lat: number;
  lon: number;
  kind?: string;
  alt_names?: string[];
};

type Cfg = {
  center: [number, number];
  zoom: number;
  minZoom: number;
  maxZoom: number;
  bounds: [[number, number], [number, number]];
};

function formatKind(kind?: string) {
  return kind ? kind.replace(/_/g, ' ') : '';
}

export default function MapsPageClient({
  places,
  cfg,
  initialFocusId
}: {
  places: Place[];
  cfg: Cfg;
  initialFocusId?: string;
}) {
  const [focusId, setFocusId] = useState<string | null>(initialFocusId ?? null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!initialFocusId) return;
    setFocusId(initialFocusId);
  }, [initialFocusId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setCopied(false);
    const url = new URL(window.location.href);
    if (focusId) url.searchParams.set('place', focusId);
    else url.searchParams.delete('place');
    window.history.replaceState({}, '', url);
  }, [focusId]);

  const focus = useMemo(() => {
    const p = places.find((x) => x.id === focusId);
    return p ? { lat: p.lat, lon: p.lon } : null;
  }, [focusId, places]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) {
        window.clearTimeout(copyTimer.current);
      }
    };
  }, []);

  async function copyLink() {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div className="mt-6">
        <MapClient
          center={cfg.center}
          zoom={cfg.zoom}
          minZoom={cfg.minZoom}
          maxZoom={cfg.maxZoom}
          bounds={cfg.bounds}
          places={places}
          className="w-full rounded border"
          focus={focus}
          fitTrigger={fitTrigger}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={() => setFitTrigger((n) => n + 1)}
          title="Reset view to show all places"
          aria-label="Reset view to show all places"
        >
          Reset view
        </button>

        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={copyLink}
          title="Copy a shareable link to this view"
          aria-label="Copy a shareable link to this view"
        >
          Copy link
        </button>

        {copied ? (
          <span className="text-xs text-green-600" aria-live="polite">Link copied</span>
        ) : null}

        {focusId ? (
          <span className="text-sm text-gray-600">
            Focused: <code>{focusId}</code>
          </span>
        ) : null}
      </div>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {places.map((p) => {
          const focused = p.id === focusId;
          return (
            <li
              key={p.id}
              className={`rounded border p-3 cursor-pointer ${focused ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-gray-50'}`}
              onClick={() => setFocusId(p.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setFocusId(p.id);
              }}
              aria-pressed={focused}
              aria-label={`Focus map on ${p.name}`}
              title="Click to focus on the map"
            >
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">
                {formatKind(p.kind)} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
              </div>
              {p.alt_names?.length ? (
                <div className="text-xs text-gray-500 mt-1">
                  Also known as: {p.alt_names.join(', ')}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </>
  );
}
