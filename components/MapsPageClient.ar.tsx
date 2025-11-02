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
    port_city: 'مدينة ساحلية'
  };
  return m[kind] ?? kind.replace(/_/g, ' ');
}

export default function MapsPageClientAr({
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

  const localizedPlaces = useMemo(
    () =>
      places.map((p) => ({
        ...p,
        name: p.name_ar ?? displayName(p),
      })),
    [places]
  );

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
          places={localizedPlaces}
          className="w-full rounded border"
          focus={focus}
          fitTrigger={fitTrigger}
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={() => setFitTrigger((n) => n + 1)}
          title="إعادة الضبط لعرض كل الأماكن"
          aria-label="إعادة الضبط لعرض كل الأماكن"
        >
          إعادة الضبط
        </button>

        <button
          className="rounded border px-3 py-1 text-sm hover:bg-gray-50"
          onClick={copyLink}
          title="نسخ رابط قابل للمشاركة"
          aria-label="نسخ رابط قابل للمشاركة"
        >
          نسخ الرابط
        </button>

        {copied ? (
          <span className="text-xs text-green-600" aria-live="polite">تم نسخ الرابط</span>
        ) : null}

        {focusId ? (
          <span className="text-sm text-gray-600">
            المركّز: <code className="ltr:ml-1 rtl:mr-1">{focusId}</code>
          </span>
        ) : null}
      </div>

      <h2 className="sr-only" id="map-places-heading">
        قائمة الأماكن
      </h2>
      <ul
        aria-labelledby="map-places-heading"
        className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {places.map((p) => {
          const focused = p.id === focusId;
          return (
            <li
              key={p.id}
              className={`rounded border p-3 ${focused ? 'bg-yellow-50 border-yellow-300' : 'hover:bg-gray-50'}`}
            >
              <button
                type="button"
                className="block w-full text-left"
                onClick={() => setFocusId(p.id)}
                aria-pressed={focused}
                aria-label={`التركيز على ${displayName(p)} في الخريطة`}
                title="انقر للتركيز على الخريطة"
              >
                <div className="font-medium">{displayName(p)}</div>
                <div className="text-sm text-gray-600">
                  {formatKindAr(p.kind)} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
                </div>
                {p.alt_names?.length ? (
                  <div className="text-xs text-gray-500 mt-1">
                    أسماء أخرى: {p.alt_names.join('، ')}
                  </div>
                ) : null}
              </button>
              <div className="mt-2 text-xs text-gray-600 flex flex-wrap gap-3">
                <a
                  href={`/ar/places/${p.id}`}
                  className="underline hover:no-underline"
                  aria-label={`فتح صفحة المكان ${displayName(p)}`}
                  title="فتح صفحة المكان"
                >
                  فتح صفحة المكان →
                </a>
                <a
                  href={`/ar/map?place=${encodeURIComponent(p.id)}`}
                  className="underline hover:no-underline"
                  aria-label={`فتح الخريطة مركّزة على ${displayName(p)}`}
                  title="فتح الخريطة مركّزة على هذا المكان"
                >
                  فتح على الخريطة
                </a>
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}
