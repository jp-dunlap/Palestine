'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { useId } from 'react';

import { useAnnouncer } from './Announcer';

// Load MapClient only on the client so SSR never touches Leaflet/window.
const MapClient = dynamic(() => import('./MapClient'), { ssr: false });

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
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [focusAnnouncement, setFocusAnnouncement] = useState('');
  const listRegionId = 'map-places-region';
  const mapRegionHeadingId = useId();
  const listRegionHeadingId = useId();
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const listContainerRef = useRef<HTMLUListElement | null>(null);
  const { announce } = useAnnouncer();
  const setMapContainer = useCallback((el: HTMLDivElement | null) => {
    mapContainerRef.current = el;
  }, []);

  useEffect(() => {
    if (!initialFocusId) return;
    setFocusId(initialFocusId);
  }, [initialFocusId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (focusId) url.searchParams.set('place', focusId);
    else url.searchParams.delete('place');
    window.history.replaceState({}, '', url);
  }, [focusId]);

  const focus = useMemo(() => {
    const p = places.find((x) => x.id === focusId);
    return p ? { lat: p.lat, lon: p.lon } : null;
  }, [focusId, places]);

  const focusPlace = useMemo(() => places.find((x) => x.id === focusId) ?? null, [focusId, places]);

  useEffect(() => {
    if (!focusId) {
      setFocusAnnouncement('');
      return;
    }
    const label = focusPlace?.name ?? focusId;
    setFocusAnnouncement(`Focused: ${label}`);
  }, [focusId, focusPlace]);

  const mapStatus = useMemo(() => {
    const total = places.length;
    const modeLabel = mode === 'map' ? 'Map view' : 'List view';
    return `${modeLabel}. Showing ${total} places.`;
  }, [mode, places.length]);

  const handleShowMap = useCallback(() => {
    setMode('map');
    requestAnimationFrame(() => {
      mapContainerRef.current?.focus();
    });
  }, []);

  const handleShowList = useCallback(() => {
    setMode('list');
    requestAnimationFrame(() => {
      listContainerRef.current?.focus();
    });
  }, []);

  const copyLink = useCallback(async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    try {
      if (!navigator.clipboard || typeof navigator.clipboard.writeText !== 'function') {
        throw new Error('clipboard-unavailable');
      }
      await navigator.clipboard.writeText(url);
      announce({ message: 'Link copied to clipboard', tone: 'success' });
    } catch (error) {
      try {
        const manualCopy = window.prompt('Copy this link', url);
        if (manualCopy !== null) {
          announce({ message: 'Copy the highlighted link from the prompt.', tone: 'info' });
          return;
        }
      } catch {}
      announce({
        message: 'Copy failed. Please copy the URL from your browser address bar.',
        tone: 'error',
      });
    }
  }, [announce]);

  const handleFocusMap = useCallback(() => {
    mapContainerRef.current?.focus();
  }, []);

  return (
    <>
      <div className="mt-6 flex flex-col gap-4">
        <div
          role="group"
          aria-label="View mode"
          className="inline-flex w-full max-w-xs items-center justify-between rounded border"
        >
          <button
            type="button"
            onClick={handleShowMap}
            className={`flex-1 px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 ${
              mode === 'map' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
            aria-pressed={mode === 'map'}
          >
            Map view
          </button>
          <button
            type="button"
            onClick={handleShowList}
            className={`flex-1 border-l px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 ${
              mode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
            aria-pressed={mode === 'list'}
          >
            List view
          </button>
        </div>

        <p className="text-sm text-gray-600" aria-live="polite" role="status">
          {mapStatus}
        </p>

        <section
          aria-labelledby={mapRegionHeadingId}
          className={mode === 'map' ? 'block' : 'hidden'}
        >
          <div className="flex items-center justify-between">
            <h2 id={mapRegionHeadingId} className="text-lg font-semibold">
              Map view
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={() => setFitTrigger((n) => n + 1)}
                title="Reset view to show all places"
                aria-label="Reset view to show all places"
              >
                Reset view
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={handleFocusMap}
              >
                Focus map
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={copyLink}
                title="Copy a shareable link to this view"
                aria-label="Copy a shareable link to this view"
              >
                Copy link
              </button>
            </div>
          </div>

          <div className="mt-3">
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
              ariaLabel="Map of Palestinian places"
              ariaLabelledBy={mapRegionHeadingId}
              onContainerReady={setMapContainer}
            />
          </div>

          {focusPlace ? (
            <p className="mt-3 text-sm text-gray-700">
              Focused: <strong>{focusPlace.name}</strong>
            </p>
          ) : focusId ? (
            <p className="mt-3 text-sm text-gray-700">
              Focused: <code>{focusId}</code>
            </p>
          ) : null}
        </section>
      </div>

      <section
        id={listRegionId}
        aria-labelledby={listRegionHeadingId}
        className={`mt-8 ${mode === 'list' ? 'block' : 'hidden'}`}
      >
        <h2 id={listRegionHeadingId} className="text-lg font-semibold">
          Places list
        </h2>
        <ul
          ref={listContainerRef}
          tabIndex={-1}
          aria-labelledby={listRegionHeadingId}
          className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
        {places.map((p) => {
          const focused = p.id === focusId;
          return (
            <li
              key={p.id}
              className={`place-card rounded border p-3 transition-shadow ${
                focused ? 'border-gray-900 bg-yellow-100 shadow-inner' : 'hover:bg-gray-50'
              }`}
              data-selected={focused ? 'true' : 'false'}
              aria-selected={focused}
            >
              <button
                type="button"
                className="block w-full text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={() => setFocusId(p.id)}
                aria-pressed={focused}
                aria-label={`Focus map on ${p.name}`}
                title="Click to focus on the map"
              >
                <div className="font-medium">{p.name}</div>
                <div className="text-sm text-gray-700">
                  {formatKind(p.kind)} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                </div>
                {p.alt_names?.length ? (
                  <div className="text-xs text-gray-700 mt-1">
                    Also known as: {p.alt_names.join(', ')}
                  </div>
                ) : null}
              </button>
              <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-700">
                <a
                  href={`/places/${p.id}`}
                  className="underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                  aria-label={`Open place page for ${p.name}`}
                  title="Open place page"
                >
                  Open place page →
                </a>
                <button
                  type="button"
                  className="underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                  onClick={() => setFocusId(p.id)}
                  aria-label={`Open map focused on ${p.name}`}
                  title="Open map focused on this place"
                >
                  Open on map
                </button>
              </div>
            </li>
          );
        })}
        </ul>
      </section>

      <div aria-live="polite" className="sr-only">
        {focusAnnouncement}
      </div>
    </>
  );
}
