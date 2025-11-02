import { ImageResponse } from 'next/og';
import { loadGazetteer } from '@/lib/loaders.places';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

function formatCoords(lat: number, lon: number): string {
  return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
}

export default function OgImage({ params }: { params: { id: string } }) {
  let title = 'مكان في فلسطين';
  let detail = 'المكان • فلسطين';

  const place = loadGazetteer().find((entry) => entry.id === params.id);
  if (place) {
    title = place.name_ar?.trim() || place.name || title;
    detail = `المكان • ${formatCoords(place.lat, place.lon)}`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0b0b0b',
          color: '#fdfdfd',
          padding: 64,
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundImage: 'radial-gradient(circle at 100% 100%, #222 0%, #0b0b0b 70%)',
          direction: 'rtl',
          textAlign: 'right',
        }}
      >
        <div style={{ opacity: 0.7, fontSize: 24, letterSpacing: 2 }}>{detail}</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 920 }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
        </div>
      </div>
    ),
    size
  );
}
