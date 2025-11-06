'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

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
  const [copyMessage, setCopyMessage] = useState('');
  const [focusAnnouncement, setFocusAnnouncement] = useState('');
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

  const focusPlace = useMemo(() => places.find((x) => x.id === focusId) ?? null, [focusId, places]);

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
      setCopyMessage('تم نسخ الرابط');
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => {
        setCopied(false);
        setCopyMessage('');
      }, 2500);
    } catch {
      setCopied(false);
      setCopyMessage('');
    }
  }

  const liveAnnouncement = useMemo(() => {
    return [focusAnnouncement, copyMessage].filter(Boolean).join('؛ ');
  }, [focusAnnouncement, copyMessage]);

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
          ariaLabel="خريطة الأماكن الفلسطينية"
        />
      </div>

      <div className="mt-4 flex items-center gap-3">
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
          onClick={copyLink}
          title="نسخ رابط قابل للمشاركة"
          aria-label="نسخ رابط قابل للمشاركة"
        >
          نسخ الرابط
        </button>

        {copied ? (
          <span className="text-xs text-green-600">{copyMessage || 'تم نسخ الرابط'}</span>
        ) : null}

        {focusPlace ? (
          <span className="text-sm text-gray-600">
            المركّز: <strong>{displayName(focusPlace)}</strong>
          </span>
        ) : focusId ? (
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
                  {formatKindAr(p.kind)} · {p.lat.toFixed(3)}, {p.lon.toFixed(3)}
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

      <div aria-live="polite" className="sr-only">
        {liveAnnouncement}
      </div>
    </>
  );
}
