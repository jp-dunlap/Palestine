// app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Og() {
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://palestine.example';
  // Simple, fast OG. Later we can render chapter titles dynamically.
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#0b0b0b',
          color: '#fff',
          padding: 64,
          fontSize: 54,
          lineHeight: 1.2,
          fontFamily: 'Inter, system-ui, sans-serif',
          backgroundImage:
            'radial-gradient(1000px 500px at 0% 100%, #222 0%, #0b0b0b 70%)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ opacity: 0.7, fontSize: 22, letterSpacing: 2 }}>
            فلسطين • PALESTINE
          </div>
          <div style={{ marginTop: 18, fontWeight: 700 }}>
            4,000 Years of Memory
          </div>
          <div style={{ opacity: 0.7, fontSize: 24, marginTop: 22 }}>
            {site.replace(/^https?:\/\//, '')}
          </div>
        </div>
      </div>
    ),
    size
  );
}
