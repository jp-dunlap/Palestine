'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useId } from 'react';
import dynamic from 'next/dynamic';

import { formatNumber } from '@/lib/format';

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

function isArabic(s: string) {
  return /[\u0600-\u06FF]/.test(s);
}

function displayName(p: Place) {
  const ar = p.alt_names?.find(isArabic);
  return ar ?? p.name;
}

function formatKindAr(kind?: string) {
  if (!kind) return '';
  const m: Record<string, string> = {
    city: 'مدينة',
    port_city: 'مدينة ساحلية',
  };
  return m[kind] ?? kind.replace(/_/g, ' ');
}

export default function MapsPageClientAr({
  places,
  cfg,
  initialFocusId,
}: {
  places: Place[];
  cfg: Cfg;
  initialFocusId?: string;
}) {
  const [focusId, setFocusId] = useState<string | null>(initialFocusId ?? null);
  const [fitTrigger, setFitTrigger] = useState(0);
  const [mode, setMode] = useState<'map' | 'list'>('map');
  const [focusAnnouncement, setFocusAnnouncement] = useState('');
  const mapRegionHeadingId = useId();
  const listRegionHeadingId = useId();
  const listRegionId = 'map-places-region-ar';
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

  const focusPlace = useMemo(
    () => places.find((x) => x.id === focusId) ?? null,
    [focusId, places]
  );

  const localizedPlaces = useMemo(
    () =>
      places.map((p) => ({
        ...p,
        name: p.name_ar ?? displayName(p),
      })),
    [places]
  );

  useEffect(() => {
    if (!focusId) {
      setFocusAnnouncement('');
      return;
    }
    const label = focusPlace ? displayName(focusPlace) : focusId;
    setFocusAnnouncement(`تم التركيز على ${label}`);
  }, [focusId, focusPlace]);

  const mapStatus = useMemo(() => {
    const total = places.length;
    const modeLabel = mode === 'map' ? 'عرض الخريطة' : 'عرض القائمة';
    const totalLabel = formatNumber(total, 'ar');
    return `${modeLabel}. عرض ${totalLabel} مكانًا.`;
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
      announce({ message: 'تم نسخ الرابط إلى الحافظة', tone: 'success' });
    } catch (error) {
      try {
        const manualCopy = window.prompt('انسخ هذا الرابط', url);
        if (manualCopy !== null) {
          announce({ message: 'انسخ الرابط المحدد يدويًا.', tone: 'info' });
          return;
        }
      } catch {}
      announce({
        message: 'فشل النسخ. انسخ الرابط من شريط العنوان.',
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
          aria-label="تغيير العرض"
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
            عرض الخريطة
          </button>
          <button
            type="button"
            onClick={handleShowList}
            className={`flex-1 border-l px-3 py-2 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2 ${
              mode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
            }`}
            aria-pressed={mode === 'list'}
          >
            عرض القائمة
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
              عرض الخريطة
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={() => setFitTrigger((n) => n + 1)}
                title="إعادة الضبط لعرض كل الأماكن"
                aria-label="إعادة الضبط لعرض كل الأماكن"
              >
                إعادة الضبط
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={handleFocusMap}
              >
                تركيز الخريطة
              </button>
              <button
                type="button"
                className="rounded border px-3 py-1 text-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                onClick={copyLink}
                title="نسخ رابط قابل للمشاركة"
                aria-label="نسخ رابط قابل للمشاركة"
              >
                نسخ الرابط
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
              places={localizedPlaces}
              className="w-full rounded border"
              focus={focus}
              fitTrigger={fitTrigger}
              ariaLabel="خريطة الأماكن الفلسطينية"
              ariaLabelledBy={mapRegionHeadingId}
              onContainerReady={setMapContainer}
            />
          </div>

          {focusPlace ? (
            <p className="mt-3 text-sm text-gray-700">
              المركّز: <strong>{displayName(focusPlace)}</strong>
            </p>
          ) : focusId ? (
            <p className="mt-3 text-sm text-gray-700">
              المركّز: <code className="ltr:ml-1 rtl:mr-1">{focusId}</code>
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
          قائمة الأماكن
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
                  aria-label={`التركيز على ${displayName(p)} في الخريطة`}
                  title="انقر للتركيز على الخريطة"
                >
                  <div className="font-medium">{displayName(p)}</div>
                  <div className="text-sm text-gray-700">
                    {formatKindAr(p.kind)} ·{' '}
                    {formatNumber(p.lat, 'ar', {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })}
                    {'، '}
                    {formatNumber(p.lon, 'ar', {
                      minimumFractionDigits: 3,
                      maximumFractionDigits: 3,
                    })}
                  </div>
                  {p.alt_names?.length ? (
                    <div className="text-xs text-gray-700 mt-1">
                      أسماء أخرى: {p.alt_names.join('، ')}
                    </div>
                  ) : null}
                </button>
                <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-700">
                  <a
                    href={`/ar/places/${p.id}`}
                    className="underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                    aria-label={`فتح صفحة المكان ${displayName(p)}`}
                    title="فتح صفحة المكان"
                  >
                    فتح صفحة المكان →
                  </a>
                  <button
                    type="button"
                    className="underline hover:no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-gray-900 focus-visible:outline-offset-2"
                    onClick={() => setFocusId(p.id)}
                    aria-label={`فتح الخريطة مركّزة على ${displayName(p)}`}
                    title="فتح الخريطة مركّزة على هذا المكان"
                  >
                    فتح على الخريطة
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
